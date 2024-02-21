// deno-fmt-ignore-file
// deno-lint-ignore-file
// This code was bundled using `deno bundle` and it's not recommended to edit it manually

var Status;
(function(Status) {
    Status[Status["Unknown"] = -1] = "Unknown";
    Status[Status["SqliteOk"] = 0] = "SqliteOk";
    Status[Status["SqliteError"] = 1] = "SqliteError";
    Status[Status["SqliteInternal"] = 2] = "SqliteInternal";
    Status[Status["SqlitePerm"] = 3] = "SqlitePerm";
    Status[Status["SqliteAbort"] = 4] = "SqliteAbort";
    Status[Status["SqliteBusy"] = 5] = "SqliteBusy";
    Status[Status["SqliteLocked"] = 6] = "SqliteLocked";
    Status[Status["SqliteNoMem"] = 7] = "SqliteNoMem";
    Status[Status["SqliteReadOnly"] = 8] = "SqliteReadOnly";
    Status[Status["SqliteInterrupt"] = 9] = "SqliteInterrupt";
    Status[Status["SqliteIOErr"] = 10] = "SqliteIOErr";
    Status[Status["SqliteCorrupt"] = 11] = "SqliteCorrupt";
    Status[Status["SqliteNotFound"] = 12] = "SqliteNotFound";
    Status[Status["SqliteFull"] = 13] = "SqliteFull";
    Status[Status["SqliteCantOpen"] = 14] = "SqliteCantOpen";
    Status[Status["SqliteProtocol"] = 15] = "SqliteProtocol";
    Status[Status["SqliteEmpty"] = 16] = "SqliteEmpty";
    Status[Status["SqliteSchema"] = 17] = "SqliteSchema";
    Status[Status["SqliteTooBig"] = 18] = "SqliteTooBig";
    Status[Status["SqliteConstraint"] = 19] = "SqliteConstraint";
    Status[Status["SqliteMismatch"] = 20] = "SqliteMismatch";
    Status[Status["SqliteMisuse"] = 21] = "SqliteMisuse";
    Status[Status["SqliteNoLFS"] = 22] = "SqliteNoLFS";
    Status[Status["SqliteAuth"] = 23] = "SqliteAuth";
    Status[Status["SqliteFormat"] = 24] = "SqliteFormat";
    Status[Status["SqliteRange"] = 25] = "SqliteRange";
    Status[Status["SqliteNotADB"] = 26] = "SqliteNotADB";
    Status[Status["SqliteNotice"] = 27] = "SqliteNotice";
    Status[Status["SqliteWarning"] = 28] = "SqliteWarning";
    Status[Status["SqliteRow"] = 100] = "SqliteRow";
    Status[Status["SqliteDone"] = 101] = "SqliteDone";
})(Status || (Status = {}));
var OpenFlags;
(function(OpenFlags) {
    OpenFlags[OpenFlags["ReadOnly"] = 1] = "ReadOnly";
    OpenFlags[OpenFlags["ReadWrite"] = 2] = "ReadWrite";
    OpenFlags[OpenFlags["Create"] = 4] = "Create";
    OpenFlags[OpenFlags["Uri"] = 64] = "Uri";
    OpenFlags[OpenFlags["Memory"] = 128] = "Memory";
})(OpenFlags || (OpenFlags = {}));
var DeserializeFlags;
(function(DeserializeFlags) {
    DeserializeFlags[DeserializeFlags["FreeOnClose"] = 1] = "FreeOnClose";
    DeserializeFlags[DeserializeFlags["Resizeable"] = 2] = "Resizeable";
    DeserializeFlags[DeserializeFlags["ReadOnly"] = 4] = "ReadOnly";
})(DeserializeFlags || (DeserializeFlags = {}));
var FunctionFlags;
(function(FunctionFlags) {
    FunctionFlags[FunctionFlags["Deterministic"] = 2048] = "Deterministic";
    FunctionFlags[FunctionFlags["DirectOnly"] = 524288] = "DirectOnly";
})(FunctionFlags || (FunctionFlags = {}));
var Types;
(function(Types) {
    Types[Types["Integer"] = 1] = "Integer";
    Types[Types["Float"] = 2] = "Float";
    Types[Types["Text"] = 3] = "Text";
    Types[Types["Blob"] = 4] = "Blob";
    Types[Types["Null"] = 5] = "Null";
    Types[Types["BigInteger"] = 6] = "BigInteger";
})(Types || (Types = {}));
var Values;
(function(Values) {
    Values[Values["Error"] = -1] = "Error";
    Values[Values["Null"] = 0] = "Null";
})(Values || (Values = {}));
function getStr(wasm, ptr) {
    const len = wasm.str_len(ptr);
    const bytes = new Uint8Array(wasm.memory.buffer, ptr, len);
    if (len > 16) {
        return new TextDecoder().decode(bytes);
    } else {
        let str = "";
        let idx = 0;
        while(idx < len){
            let u0 = bytes[idx++];
            if (!(u0 & 0x80)) {
                str += String.fromCharCode(u0);
                continue;
            }
            const u1 = bytes[idx++] & 63;
            if ((u0 & 0xE0) == 0xC0) {
                str += String.fromCharCode((u0 & 31) << 6 | u1);
                continue;
            }
            const u2 = bytes[idx++] & 63;
            if ((u0 & 0xF0) == 0xE0) {
                u0 = (u0 & 15) << 12 | u1 << 6 | u2;
            } else {
                u0 = (u0 & 7) << 18 | u1 << 12 | u2 << 6 | bytes[idx++] & 63;
            }
            if (u0 < 0x10000) {
                str += String.fromCharCode(u0);
            } else {
                const ch = u0 - 0x10000;
                str += String.fromCharCode(0xD800 | ch >> 10, 0xDC00 | ch & 0x3FF);
            }
        }
        return str;
    }
}
class SqliteError extends Error {
    constructor(context, code){
        let message;
        let status;
        if (typeof context === "string") {
            message = context;
            status = Status.Unknown;
        } else {
            message = getStr(context, context.get_sqlite_error_str());
            status = context.get_status();
        }
        super(message);
        this.code = code ?? status;
        this.name = "SqliteError";
    }
    code;
    get codeName() {
        return Status[this.code];
    }
}
function setStr(wasm, str, closure) {
    const bytes = new TextEncoder().encode(str);
    const ptr = wasm.malloc(bytes.length + 1);
    if (ptr === 0) {
        throw new SqliteError("Out of memory.");
    }
    const mem = new Uint8Array(wasm.memory.buffer, ptr, bytes.length + 1);
    mem.set(bytes);
    mem[bytes.length] = 0;
    try {
        const result = closure(ptr);
        wasm.free(ptr);
        return result;
    } catch (error) {
        wasm.free(ptr);
        throw error;
    }
}
function setArr(wasm, arr, closure) {
    const ptr = wasm.malloc(arr.length);
    if (ptr === 0) {
        throw new SqliteError("Out of memory.");
    }
    const mem = new Uint8Array(wasm.memory.buffer, ptr, arr.length);
    mem.set(arr);
    try {
        const result = closure(ptr);
        wasm.free(ptr);
        return result;
    } catch (error) {
        wasm.free(ptr);
        throw error;
    }
}
const DB_NAME = "sqlitevfs";
const LOADED_FILES = new Map();
const OPEN_FILES = new Map();
function nextRid() {
    const rid = (nextRid?.LAST_RID ?? 0) + 1;
    nextRid.LAST_RID = rid;
    return rid;
}
function getOpenFile(rid) {
    if (!OPEN_FILES.has(rid)) {
        throw new Error(`Resource ID ${rid} does not exist.`);
    }
    return OPEN_FILES.get(rid);
}
class Buffer {
    constructor(data){
        this._data = data ?? new Uint8Array();
        this._size = this._data.length;
    }
    get size() {
        return this._size;
    }
    read(offset, buffer) {
        if (offset >= this._size) return 0;
        const toCopy = this._data.subarray(offset, Math.min(this._size, offset + buffer.length));
        buffer.set(toCopy);
        return toCopy.length;
    }
    reserve(capacity) {
        if (this._data.length >= capacity) return;
        const neededBytes = capacity - this._data.length;
        const growBy = Math.min(65536, Math.max(2048, this._data.length));
        const newArray = new Uint8Array(this._data.length + Math.max(growBy, neededBytes));
        newArray.set(this._data);
        this._data = newArray;
    }
    write(offset, buffer) {
        this.reserve(offset + buffer.length);
        this._data.set(buffer, offset);
        this._size = Math.max(this._size, offset + buffer.length);
        return buffer.length;
    }
    truncate(size) {
        this._size = size;
    }
    toUint8Array() {
        return this._data.subarray(0, this._size);
    }
}
const indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
const database = new Promise((resolve, reject)=>{
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = ()=>request.result.createObjectStore("files", {
            keyPath: "name"
        });
    request.onsuccess = ()=>resolve(request.result);
    request.onerror = ()=>reject(request.error);
});
async function loadFile(fileName) {
    const db = await database;
    const file = await new Promise((resolve, reject)=>{
        const store = db.transaction("files", "readonly").objectStore("files");
        const request = store.get(fileName);
        request.onsuccess = ()=>resolve(request.result);
        request.onerror = ()=>reject(request.error);
    });
    if (file != null && !LOADED_FILES.has(fileName)) {
        const buffer = new Buffer(file.data);
        LOADED_FILES.set(fileName, buffer);
        return buffer;
    } else if (LOADED_FILES.has(fileName)) {
        return LOADED_FILES.get(fileName);
    } else {
        return null;
    }
}
async function syncFile(fileName, data) {
    const db = await database;
    await new Promise((resolve, reject)=>{
        const store = db.transaction("files", "readwrite").objectStore("files");
        const request = store.put({
            name: fileName,
            data
        });
        request.onsuccess = ()=>resolve();
        request.onerror = ()=>reject(request.error);
    });
}
async function deleteFile(fileName) {
    const db = await database;
    await new Promise((resolve, reject)=>{
        const store = db.transaction("files", "readwrite").objectStore("files");
        const request = store.delete(fileName);
        request.onsuccess = ()=>resolve();
        request.onerror = ()=>reject(request.error);
    });
}
async function writeFile(fileName, data) {
    await syncFile(fileName, data);
    if (LOADED_FILES.has(fileName)) {
        const buffer = LOADED_FILES.get(fileName);
        buffer.truncate(0);
        buffer.write(0, data);
    }
}
function env(inst) {
    const env = {
        js_print: (str_ptr)=>{
            const text = getStr(inst.exports, str_ptr);
            console.log(text[text.length - 1] === "\n" ? text.slice(0, -1) : text);
        },
        js_open: (path_ptr, mode, _flags)=>{
            if (mode === 1) {
                const rid = nextRid();
                OPEN_FILES.set(rid, {
                    path: null,
                    buffer: new Buffer()
                });
                return rid;
            } else if (mode === 0) {
                const path = getStr(inst.exports, path_ptr);
                const buffer = LOADED_FILES.get(path) ?? new Buffer();
                if (!LOADED_FILES.has(path)) LOADED_FILES.set(path, buffer);
                const rid = nextRid();
                OPEN_FILES.set(rid, {
                    path,
                    buffer
                });
                return rid;
            }
        },
        js_close: (rid)=>{
            OPEN_FILES.delete(rid);
        },
        js_delete: (path_ptr)=>{
            const path = getStr(inst.exports, path_ptr);
            LOADED_FILES.delete(path);
            deleteFile(path);
        },
        js_read: (rid, buffer_ptr, offset, amount)=>{
            const buffer = new Uint8Array(inst.exports.memory.buffer, buffer_ptr, amount);
            const file = getOpenFile(rid);
            return file.buffer.read(offset, buffer);
        },
        js_write: (rid, buffer_ptr, offset, amount)=>{
            const buffer = new Uint8Array(inst.exports.memory.buffer, buffer_ptr, amount);
            const file = getOpenFile(rid);
            return file.buffer.write(offset, buffer);
        },
        js_truncate: (rid, size)=>{
            getOpenFile(rid).buffer.truncate(size);
        },
        js_sync: (rid)=>{
            const file = getOpenFile(rid);
            if (file.path != null) syncFile(file.path, file.buffer.toUint8Array());
        },
        js_size: (rid)=>{
            return getOpenFile(rid).buffer.size;
        },
        js_lock: (_rid, _exclusive)=>{},
        js_unlock: (_rid)=>{},
        js_time: ()=>{
            return Date.now();
        },
        js_timezone: ()=>{
            return new Date().getTimezoneOffset();
        },
        js_exists: (path_ptr)=>{
            const path = getStr(inst.exports, path_ptr);
            return LOADED_FILES.has(path) ? 1 : 0;
        },
        js_access: (_path_ptr)=>1
    };
    return {
        env
    };
}
function decode(base64) {
    const bytesStr = atob(base64);
    const bytes = new Uint8Array(bytesStr.length);
    for(let i = 0, c = bytesStr.length; i < c; i++){
        bytes[i] = bytesStr.charCodeAt(i);
    }
    return bytes;
}
const moduleOrInstance = {
    module: null,
    instances: []
};
async function compile() {
    moduleOrInstance.module = await WebAssembly.compile(decode(wasm));
}
async function instantiateBrowser() {
    const functions = [];
    const placeholder = {
        exports: null,
        functions
    };
    const instance = await WebAssembly.instantiate(moduleOrInstance.module, env(placeholder));
    placeholder.exports = instance.exports;
    instance.functions = functions;
    instance.exports.seed_rng(Date.now());
    moduleOrInstance.instances.push(instance);
}
function instantiate() {
    if (moduleOrInstance.instances.length) {
        return moduleOrInstance.instances.pop();
    } else {
        const functions = [];
        const placeholder = {
            exports: null,
            functions
        };
        const instance = new WebAssembly.Instance(moduleOrInstance.module, env(placeholder));
        placeholder.exports = instance.exports;
        instance.functions = functions;
        instance.exports.seed_rng(Date.now());
        return instance;
    }
}
class PreparedQuery {
    #wasm;
    #stmt;
    #openStatements;
    #status;
    #iterKv;
    #rowKeys;
    #finalized;
    constructor(wasm, stmt, openStatements){
        this.#wasm = wasm;
        this.#stmt = stmt;
        this.#openStatements = openStatements;
        this.#status = Status.Unknown;
        this.#iterKv = false;
        this.#finalized = false;
    }
    #startQuery(params) {
        if (this.#finalized) {
            throw new SqliteError("Query is finalized.");
        }
        this.#wasm.reset(this.#stmt);
        this.#wasm.clear_bindings(this.#stmt);
        let parameters = [];
        if (Array.isArray(params)) {
            parameters = params;
        } else if (typeof params === "object") {
            for (const key of Object.keys(params)){
                let name = key;
                if (name[0] !== ":" && name[0] !== "@" && name[0] !== "$") {
                    name = `:${name}`;
                }
                const idx = setStr(this.#wasm, name, (ptr)=>this.#wasm.bind_parameter_index(this.#stmt, ptr));
                if (idx === Values.Error) {
                    throw new SqliteError(`No parameter named '${name}'.`);
                }
                parameters[idx - 1] = params[key];
            }
        }
        for(let i = 0; i < parameters.length; i++){
            let value = parameters[i];
            let status;
            switch(typeof value){
                case "boolean":
                    value = value ? 1 : 0;
                case "number":
                    if (Number.isSafeInteger(value)) {
                        status = this.#wasm.bind_int(this.#stmt, i + 1, value);
                    } else {
                        status = this.#wasm.bind_double(this.#stmt, i + 1, value);
                    }
                    break;
                case "bigint":
                    if (value > 9223372036854775807n || value < -9223372036854775808n) {
                        throw new SqliteError(`BigInt value ${value} overflows 64 bit integer.`);
                    } else {
                        const posVal = value >= 0n ? value : -value;
                        const sign = value >= 0n ? 1 : -1;
                        const upper = Number(BigInt.asUintN(32, posVal >> 32n));
                        const lower = Number(BigInt.asUintN(32, posVal));
                        status = this.#wasm.bind_big_int(this.#stmt, i + 1, sign, upper, lower);
                    }
                    break;
                case "string":
                    status = setStr(this.#wasm, value, (ptr)=>this.#wasm.bind_text(this.#stmt, i + 1, ptr));
                    break;
                default:
                    if (value instanceof Date) {
                        status = setStr(this.#wasm, value.toISOString(), (ptr)=>this.#wasm.bind_text(this.#stmt, i + 1, ptr));
                    } else if (value instanceof Uint8Array) {
                        const size = value.length;
                        status = setArr(this.#wasm, value, (ptr)=>this.#wasm.bind_blob(this.#stmt, i + 1, ptr, size));
                    } else if (value === null || value === undefined) {
                        status = this.#wasm.bind_null(this.#stmt, i + 1);
                    } else {
                        throw new SqliteError(`Can not bind ${typeof value}.`);
                    }
                    break;
            }
            if (status !== Status.SqliteOk) {
                throw new SqliteError(this.#wasm, status);
            }
        }
    }
    #getQueryRow() {
        if (this.#finalized) {
            throw new SqliteError("Query is finalized.");
        }
        const columnCount = this.#wasm.column_count(this.#stmt);
        const row = new Array(columnCount);
        for(let columnIdx = 0; columnIdx < columnCount; columnIdx++){
            switch(this.#wasm.column_type(this.#stmt, columnIdx)){
                case Types.Integer:
                    row[columnIdx] = this.#wasm.column_int(this.#stmt, columnIdx);
                    break;
                case Types.Float:
                    row[columnIdx] = this.#wasm.column_double(this.#stmt, columnIdx);
                    break;
                case Types.Text:
                    row[columnIdx] = getStr(this.#wasm, this.#wasm.column_text(this.#stmt, columnIdx));
                    break;
                case Types.Blob:
                    {
                        const ptr = this.#wasm.column_blob(this.#stmt, columnIdx);
                        if (ptr === 0) {
                            row[columnIdx] = null;
                        } else {
                            const length = this.#wasm.column_bytes(this.#stmt, columnIdx);
                            row[columnIdx] = new Uint8Array(this.#wasm.memory.buffer, ptr, length).slice();
                        }
                        break;
                    }
                case Types.BigInteger:
                    {
                        const ptr = this.#wasm.column_text(this.#stmt, columnIdx);
                        row[columnIdx] = BigInt(getStr(this.#wasm, ptr));
                        break;
                    }
                default:
                    row[columnIdx] = null;
                    break;
            }
        }
        return row;
    }
    #makeRowObject(row) {
        if (this.#rowKeys == null) {
            const rowCount = this.#wasm.column_count(this.#stmt);
            this.#rowKeys = [];
            for(let i = 0; i < rowCount; i++){
                this.#rowKeys.push(getStr(this.#wasm, this.#wasm.column_name(this.#stmt, i)));
            }
        }
        const obj = row.reduce((obj, val, idx)=>{
            obj[this.#rowKeys[idx]] = val;
            return obj;
        }, {});
        return obj;
    }
    iter(params) {
        this.#startQuery(params);
        this.#status = this.#wasm.step(this.#stmt);
        if (this.#status !== Status.SqliteRow && this.#status !== Status.SqliteDone) {
            throw new SqliteError(this.#wasm, this.#status);
        }
        this.#iterKv = false;
        return this;
    }
    iterEntries(params) {
        this.iter(params);
        this.#iterKv = true;
        return this;
    }
    [Symbol.iterator]() {
        return this;
    }
    next() {
        if (this.#status === Status.SqliteRow) {
            const value = this.#getQueryRow();
            this.#status = this.#wasm.step(this.#stmt);
            if (this.#iterKv) {
                return {
                    value: this.#makeRowObject(value),
                    done: false
                };
            } else {
                return {
                    value,
                    done: false
                };
            }
        } else if (this.#status === Status.SqliteDone) {
            return {
                value: null,
                done: true
            };
        } else {
            throw new SqliteError(this.#wasm, this.#status);
        }
    }
    all(params) {
        this.#startQuery(params);
        const rows = [];
        this.#status = this.#wasm.step(this.#stmt);
        while(this.#status === Status.SqliteRow){
            rows.push(this.#getQueryRow());
            this.#status = this.#wasm.step(this.#stmt);
        }
        if (this.#status !== Status.SqliteDone) {
            throw new SqliteError(this.#wasm, this.#status);
        }
        return rows;
    }
    allEntries(params) {
        return this.all(params).map((row)=>this.#makeRowObject(row));
    }
    first(params) {
        this.#startQuery(params);
        this.#status = this.#wasm.step(this.#stmt);
        let row = undefined;
        if (this.#status === Status.SqliteRow) {
            row = this.#getQueryRow();
        }
        while(this.#status === Status.SqliteRow){
            this.#status = this.#wasm.step(this.#stmt);
        }
        if (this.#status !== Status.SqliteDone) {
            throw new SqliteError(this.#wasm, this.#status);
        }
        return row;
    }
    firstEntry(params) {
        const row = this.first(params);
        return row === undefined ? undefined : this.#makeRowObject(row);
    }
    one(params) {
        const rows = this.all(params);
        if (rows.length === 0) {
            throw new SqliteError("The query did not return any rows.");
        } else if (rows.length > 1) {
            throw new SqliteError("The query returned more than one row.");
        } else {
            return rows[0];
        }
    }
    oneEntry(params) {
        return this.#makeRowObject(this.one(params));
    }
    execute(params) {
        this.#startQuery(params);
        this.#status = this.#wasm.step(this.#stmt);
        while(this.#status === Status.SqliteRow){
            this.#status = this.#wasm.step(this.#stmt);
        }
        if (this.#status !== Status.SqliteDone) {
            throw new SqliteError(this.#wasm, this.#status);
        }
    }
    finalize() {
        if (!this.#finalized) {
            this.#wasm.finalize(this.#stmt);
            this.#openStatements.delete(this.#stmt);
            this.#finalized = true;
        }
    }
    columns() {
        if (this.#finalized) {
            throw new SqliteError("Unable to retrieve column names from finalized transaction.");
        }
        const columnCount = this.#wasm.column_count(this.#stmt);
        const columns = [];
        for(let i = 0; i < columnCount; i++){
            const name = getStr(this.#wasm, this.#wasm.column_name(this.#stmt, i));
            const originName = getStr(this.#wasm, this.#wasm.column_origin_name(this.#stmt, i));
            const tableName = getStr(this.#wasm, this.#wasm.column_table_name(this.#stmt, i));
            columns.push({
                name,
                originName,
                tableName
            });
        }
        return columns;
    }
    expandSql(params) {
        this.#startQuery(params);
        const ptr = this.#wasm.expanded_sql(this.#stmt);
        const sql = getStr(this.#wasm, ptr);
        if (ptr != Values.Null) this.#wasm.sqlite_free(ptr);
        return sql;
    }
}
function wrapSqlFunction(wasm, name, func) {
    return (argCount)=>{
        const args = new Array(argCount);
        for(let argIdx = 0; argIdx < argCount; argIdx++){
            switch(wasm.argument_type(argIdx)){
                case Types.Integer:
                    args[argIdx] = wasm.argument_int(argIdx);
                    break;
                case Types.Float:
                    args[argIdx] = wasm.argument_double(argIdx);
                    break;
                case Types.Text:
                    args[argIdx] = getStr(wasm, wasm.argument_text(argIdx));
                    break;
                case Types.Blob:
                    {
                        const ptr = wasm.argument_blob(argIdx);
                        if (ptr === 0) {
                            args[argIdx] = null;
                        } else {
                            const length = wasm.argument_bytes(argIdx);
                            args[argIdx] = new Uint8Array(wasm.memory.buffer, ptr, length).slice();
                        }
                        break;
                    }
                case Types.BigInteger:
                    {
                        const ptr = wasm.argument_text(argIdx);
                        args[argIdx] = BigInt(getStr(wasm, ptr));
                        break;
                    }
                default:
                    args[argIdx] = null;
                    break;
            }
        }
        try {
            let result = func.apply(null, args);
            switch(typeof result){
                case "boolean":
                    result = result ? 1 : 0;
                case "number":
                    if (Number.isSafeInteger(result)) {
                        wasm.result_int(result);
                    } else {
                        wasm.result_double(result);
                    }
                    break;
                case "bigint":
                    if (result > 9223372036854775807n || result < -9223372036854775808n) {
                        throw new SqliteError(`BigInt result ${result} overflows 64 bit integer.`);
                    } else {
                        const posVal = result >= 0n ? result : -result;
                        const sign = result >= 0n ? 1 : -1;
                        const upper = Number(BigInt.asUintN(32, posVal >> 32n));
                        const lower = Number(BigInt.asUintN(32, posVal));
                        wasm.result_big_int(sign, upper, lower);
                    }
                    break;
                case "string":
                    setStr(wasm, result, (ptr)=>wasm.result_text(ptr));
                    break;
                default:
                    if (result instanceof Date) {
                        setStr(wasm, result.toISOString(), (ptr)=>wasm.result_text(ptr));
                    } else if (result instanceof Uint8Array) {
                        const size = result.length;
                        setArr(wasm, result, (ptr)=>wasm.result_blob(ptr, size));
                    } else if (result === null || result === undefined) {
                        wasm.result_null();
                    } else {
                        throw new SqliteError(`Can not return ${typeof result}.`);
                    }
                    break;
            }
        } catch (error) {
            setStr(wasm, `Error in user defined function '${name}': ${error?.message}`, (ptr)=>wasm.result_error(ptr, Status.SqliteError));
        }
    };
}
class DB {
    #wasm;
    #functions;
    #open;
    #statements;
    #functionNames;
    #transactionDepth;
    constructor(path = ":memory:", options = {}){
        const instance = instantiate();
        this.#wasm = instance.exports;
        this.#functions = instance.functions;
        this.#open = false;
        this.#statements = new Set();
        this.#functionNames = new Map();
        this.#transactionDepth = 0;
        let flags = 0;
        switch(options.mode){
            case "read":
                flags = OpenFlags.ReadOnly;
                break;
            case "write":
                flags = OpenFlags.ReadWrite;
                break;
            case "create":
            default:
                flags = OpenFlags.ReadWrite | OpenFlags.Create;
                break;
        }
        if (options.memory === true) {
            flags |= OpenFlags.Memory;
        }
        if (options.uri === true) {
            flags |= OpenFlags.Uri;
        }
        const status = setStr(this.#wasm, path, (ptr)=>this.#wasm.open(ptr, flags));
        if (status !== Status.SqliteOk) {
            throw new SqliteError(this.#wasm, status);
        }
        this.#open = true;
    }
    query(sql, params) {
        const query = this.prepareQuery(sql);
        try {
            const rows = query.all(params);
            query.finalize();
            return rows;
        } catch (err) {
            query.finalize();
            throw err;
        }
    }
    queryEntries(sql, params) {
        const query = this.prepareQuery(sql);
        try {
            const rows = query.allEntries(params);
            query.finalize();
            return rows;
        } catch (err) {
            query.finalize();
            throw err;
        }
    }
    prepareQuery(sql) {
        if (!this.#open) {
            throw new SqliteError("Database was closed.");
        }
        const stmt = setStr(this.#wasm, sql, (ptr)=>this.#wasm.prepare(ptr));
        if (stmt === Values.Null) {
            throw new SqliteError(this.#wasm);
        }
        this.#statements.add(stmt);
        return new PreparedQuery(this.#wasm, stmt, this.#statements);
    }
    execute(sql) {
        const status = setStr(this.#wasm, sql, (ptr)=>this.#wasm.exec(ptr));
        if (status !== Status.SqliteOk) {
            throw new SqliteError(this.#wasm, status);
        }
    }
    transaction(closure) {
        this.#transactionDepth += 1;
        this.execute(`SAVEPOINT _deno_sqlite_sp_${this.#transactionDepth}`);
        try {
            return closure();
        } catch (err) {
            this.execute(`ROLLBACK TO _deno_sqlite_sp_${this.#transactionDepth}`);
            throw err;
        } finally{
            this.execute(`RELEASE _deno_sqlite_sp_${this.#transactionDepth}`);
            this.#transactionDepth -= 1;
        }
    }
    serialize(schema = "main") {
        const ptr = setStr(this.#wasm, schema, (ptr)=>this.#wasm.serialize(ptr));
        if (ptr === Values.Null) {
            throw new SqliteError(`Failed to serialize database '${schema}'`);
        }
        const length = this.#wasm.serialize_bytes();
        const data = new Uint8Array(this.#wasm.memory.buffer, ptr, length).slice();
        this.#wasm.sqlite_free(ptr);
        return data;
    }
    deserialize(data, options) {
        const dataPtr = this.#wasm.sqlite_malloc(data.length);
        if (dataPtr === Values.Null) {
            throw new SqliteError("Out of memory.", Status.SqliteNoMem);
        } else {
            const mem = new Uint8Array(this.#wasm.memory.buffer, dataPtr, data.length);
            mem.set(data);
        }
        let flags = DeserializeFlags.FreeOnClose;
        switch(options?.mode){
            case "read":
                flags |= DeserializeFlags.ReadOnly;
                break;
            case "write":
            default:
                flags |= DeserializeFlags.Resizeable;
                break;
        }
        const schema = options?.schema ?? "main";
        const status = setStr(this.#wasm, schema, (schemaPtr)=>this.#wasm.deserialize(schemaPtr, dataPtr, data.length, flags));
        if (status !== Status.SqliteOk) {
            throw new SqliteError(`Failed to deserialize into database '${schema}'`, status);
        }
    }
    createFunction(func, options) {
        const name = options?.name ?? func.name;
        if (name === "") {
            throw new SqliteError("Function name can not be empty");
        } else if (this.#functionNames.has(name)) {
            throw new SqliteError(`A function named '${name}' already exists`);
        }
        const argc = func.length === 0 ? -1 : func.length;
        let flags = 0;
        if (options?.deterministic ?? false) flags |= FunctionFlags.Deterministic;
        if (options?.directOnly ?? true) flags |= FunctionFlags.DirectOnly;
        let funcIdx = 0;
        while(this.#functions[funcIdx] != undefined)funcIdx++;
        const status = setStr(this.#wasm, name, (name)=>this.#wasm.create_function(name, argc, flags, funcIdx));
        if (status !== Status.SqliteOk) {
            throw new SqliteError(this.#wasm, status);
        } else {
            this.#functions[funcIdx] = wrapSqlFunction(this.#wasm, name, func);
            this.#functionNames.set(name, funcIdx);
        }
    }
    deleteFunction(name) {
        if (this.#functionNames.has(name)) {
            const status = setStr(this.#wasm, name, (pts)=>this.#wasm.delete_function(pts));
            if (status === Status.SqliteOk) {
                const funcIdx = this.#functionNames.get(name);
                this.#functionNames.delete(name);
                delete this.#functions[funcIdx];
            } else {
                throw new SqliteError(this.#wasm, status);
            }
        } else {
            throw new SqliteError(`User defined function '${name}' does not exist`);
        }
    }
    close(force = false) {
        if (!this.#open) {
            return;
        }
        if (force) {
            for (const stmt of this.#statements){
                if (this.#wasm.finalize(stmt) !== Status.SqliteOk) {
                    throw new SqliteError(this.#wasm);
                }
            }
        }
        if (this.#wasm.close() !== Status.SqliteOk) {
            throw new SqliteError(this.#wasm);
        }
        this.#open = false;
    }
    get lastInsertRowId() {
        return this.#wasm.last_insert_rowid();
    }
    get changes() {
        return this.#wasm.changes();
    }
    get totalChanges() {
        return this.#wasm.total_changes();
    }
    get autoCommit() {
        return this.#wasm.autocommit() !== 0;
    }
    get isClosed() {
        return !this.#open;
    }
}
export { SqliteError as SqliteError };
export { Status as Status };
const hasCompiled = compile();
async function open(file) {
    if (file != null && file !== ":memory:") await loadFile(file);
    await hasCompiled;
    await instantiateBrowser();
    return new DB(file);
}
async function write(file, data) {
    await writeFile(file, data);
}
async function read(file) {
    const buffer = await loadFile(file);
    return buffer?.toUint8Array()?.slice();
}
export { open as open };
export { write as write };
export { read as read };