//go:build js && wasm

package main

import (
	"math/rand"
	"syscall/js"

	"github.com/ok-yyyy/conway-go-wasm/internal/conway"
)

var board *conway.Board

func main() {
	c := make(chan struct{})

	js.Global().Set("initBoard", js.FuncOf(initBoard))
	js.Global().Set("step", js.FuncOf(step))
	js.Global().Set("fillBoard", js.FuncOf(fillBoard))

	<-c
}

func initBoard(this js.Value, args []js.Value) interface{} {
	width := args[0].Int()
	height := args[1].Int()
	board = conway.NewBoard(width, height)

	// ランダムに初期化
	for i := range board.Cells {
		if rand.Float64() < 0.1 {
			board.Cells[i] = 1
		}
	}

	return nil
}

func step(this js.Value, args []js.Value) interface{} {
	if board != nil {
		board.NextGeneration()
	}
	return nil
}

func fillBoard(this js.Value, args []js.Value) interface{} {
	if board == nil || len(args) == 0 {
		return nil
	}

	dst := args[0]
	if dst.Length() < len(board.Cells) {
		return nil
	}

	js.CopyBytesToJS(dst, board.Cells)
	return nil
}
