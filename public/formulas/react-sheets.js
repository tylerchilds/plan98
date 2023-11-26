import formula from '@sillonious/formula'
import React from 'react'
import ReactDOM from 'react-dom'

function App() {
	const e = React.createElement;
	return e('a', { href: "https://www.rowsncolumns.app/", }, 'buy sheets')
}

formula('react-sheets').draw(target => {
	ReactDOM.render(
		App(),
		target
	)
})
