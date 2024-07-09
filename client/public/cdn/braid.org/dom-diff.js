import TreeSitter from 'https://esm.sh/web-tree-sitter'
export const init_dom_diff = async () => {
    if (!init_dom_diff.parser) init_dom_diff.parser = await new Promise(async (done) => {
        const Parser = TreeSitter
      debugger
        await Parser.init()
        const parser = new Parser()
        parser.setLanguage(await Parser.Language.load("https://unpkg.com/@braidjs/dom-diff/tree-sitter-html.wasm"))
        done(parser)
    })
}

export const create_dom_diff = (html) => {
    let parser = init_dom_diff.parser
    let tree = parser.parse(html)

    if (hasErrorNode(tree.rootNode)) {
        html = ''
        tree = parser.parse(html)
    }

    return {
        get: () => html,
        patch: (...args) => {
            let [start, end, content, start_row_col, end_row_col, end2_row_col] = args

            let new_html
            let end2
            if (args.length == 1) {
                new_html = start
                let [s, e, e2] = findDiffRange(html, new_html)
                start = s
                end = e
                end2 = e2
                content = new_html.slice(s, e2)
            } else {
                new_html = html.slice(0, start) + content + html.slice(end)
                end2 = start + content.length
            }

            if (!start_row_col) start_row_col = getRowColumn(html, start)
            if (!end_row_col) end_row_col = getRowColumn(html, end)
            if (!end2_row_col) end2_row_col = getRowColumn(new_html, end2)

            let tree_copy = tree.copy()
            tree_copy.edit({
                startIndex: start,
                oldEndIndex: end,
                newEndIndex: end2,
                startPosition: start_row_col,
                oldEndPosition: end_row_col,
                newEndPosition: end2_row_col,
            })

            let new_tree = parser.parse(new_html, tree_copy)

            if (hasErrorNode(new_tree.rootNode)) return []

            let diff = get_tree_diff(tree, tree_copy, new_tree, html, new_html)

            html = new_html
            tree = new_tree

            return diff
        },
    }

    function get_tree_diff(o, a, b, a_text, b_text) {
        let path = []
        let diff = []
        o = o.rootNode
        a = a.rootNode
        b = b.rootNode
        get_element_diff(o, a, b, path, diff, a_text, b_text)
        return diff
    }

    function get_element_diff(o, a, b, path, diff, a_text, b_text) {
        let padding = o.type == "element" ? 1 : 0

        let o_children = []
        let a_children = []

        for (let i = padding; i < o.childCount; i++) {
            let oo = o.child(i)
            let aa = a.child(i)
            if (oo.previousSibling?.endIndex < oo.startIndex) {
                o_children.push({
                    type: "text",
                    startIndex: oo.previousSibling.endIndex,
                    text: a_text.slice(oo.previousSibling.endIndex, oo.startIndex),
                })
                a_children.push({
                    type: "text",
                    startIndex: aa.previousSibling.endIndex,
                    text: b_text.slice(aa.previousSibling.endIndex, aa.startIndex),
                })
            }
            if (i < o.childCount - padding) {
                o_children.push(oo)
                a_children.push(aa)
            }
        }
        if (!padding) {
            let x = o.childCount ? o.child(o.childCount - 1).endIndex : 0
            if (x < o.endIndex) {
                o_children.push({ type: "text", startIndex: x, text: a_text.slice(x, o.endIndex) })
                let y = a.child(a.childCount - 1).endIndex
                a_children.push({ type: "text", startIndex: y, text: b_text.slice(y, a.endIndex) })
            }
        }

        let b_children = []

        for (let i = padding; i < b.childCount; i++) {
            let bb = b.child(i)
            if (bb.previousSibling?.endIndex < bb.startIndex) {
                b_children.push({
                    type: "text",
                    startIndex: bb.previousSibling.endIndex,
                    text: b_text.slice(bb.previousSibling.endIndex, bb.startIndex),
                })
            }
            if (i < b.childCount - padding) b_children.push(bb)
        }
        if (!padding) {
            let x = b.childCount ? b.child(b.childCount - 1).endIndex : 0
            if (x < b.endIndex) {
                b_children.push({ type: "text", startIndex: x, text: b_text.slice(x, b.endIndex) })
            }
        }

        o_children = mergeNeighboringNodes(o_children)
        for (let i = 0; i < o_children.length; i++) {
            let oo = o_children[i]
            if (oo.mergedNodes > 1) {
                let aa = a_children.splice(i, oo.mergedNodes)
                a_children.splice(i, 0, {
                    type: "text",
                    startIndex: aa[0].startIndex,
                    text: aa.map((x) => x.text).join(""),
                })
            }
        }
        b_children = mergeNeighboringNodes(b_children)

        let i = 0
        let j = 0
        let path_join = () => path.join("/") + (path.length ? "/" : "")
        while (true) {
            let oo = o_children[i]
            let aa = a_children[i]
            let bb = b_children[j]

            if (!aa && !bb) break
            else if (aa && bb && same_node(oo, aa, bb)) {
                if (aa.type == "element") {
                    path.push(`${aa.type}[${i}]`)
                    get_element_diff(oo, aa, bb, path, diff, a_text, b_text)
                    path.pop()
                }
                i++
                j++
            } else if (aa && (!bb || aa.startIndex <= bb.startIndex)) {
                diff.push({ range: `/${path_join("/")}${aa.type}[${i}]` })
                i++
            } else {
                diff.push({ range: `/${path_join("/")}*[${i}:${i}]`, content: bb.text })
                j++
            }
        }
    }

    function mergeNeighboringNodes(nodes) {
        const mergedNodes = []
        let currentText = ""
        let currentStartIndex = null
        let current_count = 0

        for (let i = 0; i < nodes.length; i++) {
            const node = nodes[i]

            if (node.type === "text" || node.type === "entity") {
                if (currentStartIndex === null) {
                    currentStartIndex = node.startIndex
                    current_count = 0
                }
                currentText += node.text
                current_count++
            } else {
                if (currentText !== "") {
                    mergedNodes.push({ mergedNodes: current_count, type: "text", startIndex: currentStartIndex, text: currentText })
                    currentText = ""
                    currentStartIndex = null
                }
                mergedNodes.push(node)
            }
        }

        if (currentText !== "") {
            mergedNodes.push({ mergedNodes: current_count, type: "text", startIndex: currentStartIndex, text: currentText })
        }

        return mergedNodes
    }

    function getRowColumn(text, position) {
        let row = 0
        let column = 0
        let currentPosition = 0

        for (let i = 0; i < text.length; i++) {
            if (i === position) {
                break
            }

            if (text[i] === "\n") {
                row++
                column = 0
            } else {
                column++
            }

            currentPosition++
        }

        return { row, column }
    }

    function same_node(o, a, b) {
        if (a.type == "text" && b.type == "text") {
            return a.startIndex == b.startIndex && o.text == b.text
        } else if (a.type == "element" && b.type == "element") {
            let o_start_tag = o.child(0)
            let a_start_tag = a.child(0)
            let b_start_tag = b.child(0)
            let o_end_tag = o.child(o.childCount - 1)
            let a_end_tag = a.child(a.childCount - 1)
            let b_end_tag = b.child(b.childCount - 1)
            return (
                a_start_tag.startIndex == b_start_tag.startIndex &&
                o_start_tag.text == b_start_tag.text &&
                a_end_tag.startIndex == b_end_tag.startIndex &&
                o_end_tag.text == b_end_tag.text
            )
        }
    }

    function findDiffRange(oldText, newText) {
        let prefixLength = 0
        let oldSuffixStart = oldText.length
        let newSuffixStart = newText.length

        while (prefixLength < oldSuffixStart && prefixLength < newSuffixStart && oldText[prefixLength] === newText[prefixLength]) {
            prefixLength++
        }

        while (oldSuffixStart > prefixLength && newSuffixStart > prefixLength && oldText[oldSuffixStart - 1] === newText[newSuffixStart - 1]) {
            oldSuffixStart--
            newSuffixStart--
        }

        return [prefixLength, oldSuffixStart, newSuffixStart]
    }

    function hasErrorNode(node) {
        if (node.type === "ERROR") return true
        for (let i = 0; i < node.childCount; i++)
            if (hasErrorNode(node.child(i))) return true
    }
}

export const apply_dom_diff = (dom, diff) => {
    let offsets = new Map()

    diff.forEach((change) => {
        let node = dom
        const [path, newValue] = [change.range, change.content]
        const indexes = []
        let insert_position = null
        path.replace(/\[(\d+)(?::(\d+))?\]/g, (_0, _1, _2) => {
            if (_2 != null) {
                insert_position = 1 * _2
            } else indexes.push(1 * _1)
        })

        if (indexes.length === 0) {
            // If there are no indicies, we assume we're deleting everything
            while (node.firstChild) node.removeChild(node.firstChild)
            offsets.set(node, 0)
            node.innerHTML = newValue
            return
        }

        if (insert_position == null) insert_position = indexes.pop()

        for (let i = 0; i < indexes.length; i++) {
            node = Array.from(node.childNodes)[indexes[i]]
        }

        const i = insert_position + (offsets.get(node) ?? 0)

        if (newValue) {
            let newElement = document.createElement("div")
            newElement.innerHTML = newValue
            newElement = newElement.firstChild

            if (i === node.childNodes.length) {
                // If the insertion index is equal to the number of child nodes,
                // append the new element as the last child
                node.appendChild(newElement)
            } else {
                // Otherwise, insert the new element at the specified index
                node.insertBefore(newElement, node.childNodes[i])
            }

            offsets.set(node, (offsets.get(node) ?? 0) + 1)
        } else {
            // If newValue is falsy, remove the child node at the specified index
            if (i >= node.childNodes.length) throw "bad"
            node.removeChild(node.childNodes[i])
            offsets.set(node, (offsets.get(node) ?? 0) - 1)
        }
    })
}
