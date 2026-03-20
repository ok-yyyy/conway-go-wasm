//go:build js && wasm

package main

import (
	"syscall/js"

	"github.com/ok-yyyy/conway-go-wasm/internal/conway"
)

var board *conway.Board

func main() {
	c := make(chan struct{})

	js.Global().Set("initBoard", js.FuncOf(initBoard))
	js.Global().Set("step", js.FuncOf(step))
	js.Global().Set("getBoard", js.FuncOf(getBoard))

	<-c
}

func initBoard(this js.Value, args []js.Value) interface{} {
	width := args[0].Int()
	height := args[1].Int()
	board = conway.NewBoard(width, height)

	// ランダムに初期化
	for i := range board.Cells {
		board.Cells[i] = js.Global().Get("Math").Call("random").Float() < 0.3
	}

	return nil
}

func step(this js.Value, args []js.Value) interface{} {
	if board != nil {
		board.NextGeneration()
	}
	return nil
}

func getBoard(this js.Value, args []js.Value) interface{} {
	dst := js.Global().Get("Uint8Array").New(len(board.Cells))
	for i, alive := range board.Cells {
		if alive {
			dst.SetIndex(i, 1)
		} else {
			dst.SetIndex(i, 0)
		}
	}

	return dst
}
