import { Consul, ConsulKV, ClientDefaultConfig, ServiceConfig, ConsulService, Check } from "https://deno.land/x/consul@v0.0.2/mod.ts"

const consulConfig = {
    hostname : "localhost",
    port     : 8080,
}

const consul = new Consul(consulConfig);

var data = {
    Key: "foo",
    Value: "bar"
}

await consul.putKey(data).then((res)=>{
    console.log(res)
})

await consul.getValue("foo").then((res)=>{
    console.log(res)
})


