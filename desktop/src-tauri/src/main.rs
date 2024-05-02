#![cfg_attr(
	all(not(debug_assertions), target_os = "windows"),
	windows_subsystem = "windows"
)]

use tauri::{
	Manager,
    Window,
    Wry
};
use std::collections::HashMap;
use tokio::sync::mpsc;
use tokio::sync::Mutex;
use tracing::info;
use tracing_subscriber;
//use serde_json::json;
use serde::Serialize;
//use gilrs::{Gilrs, Event, EventType};
use midir::{Ignore, MidiInput, MidiInputConnection};

#[derive(Default)]
pub struct MidiState {
  pub input: std::sync::Mutex<Option<MidiInputConnection<()>>>,
}

#[derive(Clone, Serialize)]
struct MidiMessage {
  message: Vec<u8>,
}

struct AsyncProcInputTx {
	inner: Mutex<mpsc::Sender<String>>,
}

fn rs2js<R: tauri::Runtime>(message: String, manager: &impl Manager<R>) {
	//info!(?message, "rs2js");
	manager
		.emit_all("rs2js", format!("{}", message))
		.unwrap();
}

#[tauri::command]
async fn js2rs(
	message: String,
	state: tauri::State<'_, AsyncProcInputTx>,
) -> Result<(), String> {
	info!(?message, "js2rs");
	let async_proc_input_tx = state.inner.lock().await;
	async_proc_input_tx
		.send(message)
		.await
		.map_err(|e| e.to_string())
}

// from https://github.com/ZaneH/piano-trainer
#[tauri::command]
fn list_midi_connections() -> HashMap<usize, String> {
  let midi_in = MidiInput::new("piano-trainer-input");
  match midi_in {
    Ok(midi_in) => {
      let mut midi_connections = HashMap::new();
      for (i, p) in midi_in.ports().iter().enumerate() {
        let port_name = midi_in.port_name(p);
        match port_name {
          Ok(port_name) => {
            midi_connections.insert(i, port_name);
          }
          Err(e) => {
            println!("Error getting port name: {}", e);
          }
        }
      }
      midi_connections
    }
    Err(_) => HashMap::new(),
  }
}

// from https://github.com/ZaneH/piano-trainer
#[tauri::command]
fn open_midi_connection(
  midi_state: tauri::State<'_, MidiState>,
  window: Window<Wry>,
  input_idx: usize,
) {
  let handle = std::sync::Arc::new(window).clone();
  let midi_in = MidiInput::new("piano-trainer-input");
  match midi_in {
    Ok(mut midi_in) => {
      midi_in.ignore(Ignore::None);
      let midi_in_ports = midi_in.ports();
      let port = midi_in_ports.get(input_idx);
      match port {
        Some(port) => {
          let midi_in_conn = midi_in.connect(
            port,
            "midir",
            move |_, message, _| {
              handle
                .emit_all(
                  "midi_message",
                  MidiMessage {
                    message: message.to_vec(),
                  },
                )
                .map_err(|e| {
                  println!("Error sending midi message: {}", e);
                })
                .ok();
            },
            (),
          );
          match midi_in_conn {
            Ok(midi_in_conn) => {
              midi_state.input.lock().unwrap().replace(midi_in_conn);
            }
            Err(e) => {
              println!("Error: {}", e);
            }
          }
        }
        None => {
          println!("No port found at index {}", input_idx);
        }
      }
    }
    Err(e) => println!("Error: {}", e),
  }
}



async fn async_process_model(
	mut input_rx: mpsc::Receiver<String>,
	output_tx: mpsc::Sender<String>,
) -> Result<(), Box<dyn std::error::Error + Send + Sync>> {
	while let Some(input) = input_rx.recv().await {
		let output = input;
		output_tx.send(output).await?;
	}

	Ok(())
}
fn main() {
	tracing_subscriber::fmt::init();

	let (async_proc_input_tx, async_proc_input_rx) = mpsc::channel(1);
	let (async_proc_output_tx, mut async_proc_output_rx) = mpsc::channel(1);

	tauri::Builder::default()
		.manage(AsyncProcInputTx {
			inner: Mutex::new(async_proc_input_tx),
		})
        .manage(MidiState {
          ..Default::default()
        })
		.invoke_handler(tauri::generate_handler![
            open_midi_connection,
            list_midi_connections,
            js2rs
        ])
		.setup(|app| {
			/* two way channel from rust async*/
			tauri::async_runtime::spawn(async move {
				async_process_model(
					async_proc_input_rx,
					async_proc_output_tx,
					).await
			});

			/* one way channel from rust to javascript */
			let app_handle = app.handle();
			tauri::async_runtime::spawn(async move {
				loop {
					if let Some(output) = async_proc_output_rx.recv().await {
						rs2js(output, &app_handle);
					}
				}
			});

			/* pipe system level gamepad data from rust to javasccript */
            /*
			let app_handle = app.handle();
			tauri::async_runtime::spawn(async move {
				let mut gilrs = Gilrs::new().unwrap();

				// Iterate over all connected gamepads
				for (_id, gamepad) in gilrs.gamepads() {
					println!("{} is {:?}", gamepad.name(), gamepad.power_info());
				}

				loop {
					// Examine new events
					while let Some(Event { id, event, time: _time }) = gilrs.next_event() {
						match event {
							EventType::AxisChanged(axis, value, _code) => {
								let message = json!({
									"id": id.to_string(),
									"key": format!("{:?}", axis),
									"event": "AxisChanged",
									"value": value
								}).to_string();
								rs2js(message, &app_handle);
							}
							EventType::ButtonChanged(button, value, _code) => {
								let message = json!({
									"id": id.to_string(),
									"key": format!("{:?}", button),
									"event": "ButtonChanged",
									"value": value
								}).to_string();
								rs2js(message, &app_handle);
							}
							EventType::Connected => {
								let message = json!({
									"id": id.to_string(),
									"event": "Connected",
								}).to_string();
								rs2js(message, &app_handle);
							}
							_ => ()
						}

					}
				}
			});
            */

            /*
			let app_handle = app.handle();
			let main_window =
				tauri::WindowBuilder::new(&app_handle, "main", tauri::WindowUrl::App("index.html".into()))
					.visible(false)
					.build()
					.expect("failed to create main window");
			main_window.set_title("Hyper").unwrap();
			main_window.center().unwrap();
            */

            Ok(())
		})
	.run(tauri::generate_context!())
	.expect("error while running tauri application");
}
