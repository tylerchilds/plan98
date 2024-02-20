import module from "@sillonious/module"
import * as sqlite from "sqlite"

const $ = module('sqlite-hello')

$.draw(() => {
	return `
		${Object.keys(sqlite).join('<br/>')}
	`
})
