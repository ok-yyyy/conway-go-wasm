package conway

type Board struct {
	width  int
	height int
	Cells  []bool
}

func NewBoard(width, height int) *Board {
	return &Board{
		width:  width,
		height: height,
		Cells:  make([]bool, width*height),
	}
}

// 次の世代へ更新する
func (b *Board) NextGeneration() {
	next := make([]bool, len(b.Cells))

	for row := 0; row < b.height; row++ {
		for col := 0; col < b.width; col++ {
			idx := b.getIndex(row, col)
			neighbors := b.liveNeighborCount(row, col)

			// ライフゲームのルール
			if b.Cells[idx] {
				next[idx] = neighbors == 2 || neighbors == 3
			} else {
				next[idx] = neighbors == 3
			}
		}
	}

	b.Cells = next
}

// 隣接する生きたセルを数える
func (b *Board) liveNeighborCount(row, col int) int {
	count := 0

	for _, dr := range []int{-1, 0, 1} {
		for _, dc := range []int{-1, 0, 1} {
			if dr == 0 && dc == 0 {
				continue
			}

			r, c := row+dr, col+dc
			if r >= 0 && r < b.height && c >= 0 && c < b.width {
				if b.Cells[b.getIndex(r, c)] {
					count++
				}
			}
		}
	}

	return count
}

func (b *Board) getIndex(row, col int) int {
	return row*b.width + col
}
