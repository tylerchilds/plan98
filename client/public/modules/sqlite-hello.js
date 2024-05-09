import module from "@silly/tag"
import * as sqlite from "sqlite"

const $ = module('sqlite-hello')

$.draw(() => {
	return `
		${Object.keys(sqlite).join('<br/>')}
	`
})
