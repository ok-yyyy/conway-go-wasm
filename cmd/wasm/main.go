//go:build js && wasm

package main

import "syscall/js"

func main() {
	c := make(chan struct{})

	js.Global().Set("wasmReady", js.FuncOf(wasmReady))

	<-c
}

func wasmReady(this js.Value, args []js.Value) interface{} {
	return js.ValueOf(true)
}
