package conway

type Board struct {
	width  int
	height int
	Cells  []byte
	next   []byte
}

func NewBoard(width, height int) *Board {
	size := width * height

	return &Board{
		width:  width,
		height: height,
		Cells:  make([]byte, size),
		next:   make([]byte, size),
	}
}

// 次の世代へ更新する
func (b *Board) NextGeneration() {
	next := b.next

	for row := 0; row < b.height; row++ {
		for col := 0; col < b.width; col++ {
			idx := b.getIndex(row, col)
			neighbors := b.liveNeighborCount(row, col)

			// ライフゲームのルール
			if b.Cells[idx] == 1 {
				if neighbors == 2 || neighbors == 3 {
					next[idx] = 1
				} else {
					next[idx] = 0
				}
			} else {
				if neighbors == 3 {
					next[idx] = 1
				} else {
					next[idx] = 0
				}
			}
		}
	}

	b.Cells, b.next = b.next, b.Cells
}

// 隣接する生きたセルを数える
func (b *Board) liveNeighborCount(row, col int) int {
	count := 0

	for _, dr := range []int{-1, 0, 1} {
		for _, dc := range []int{-1, 0, 1} {
			if dr == 0 && dc == 0 {
				continue
			}

			r := (row + dr + b.height) % b.height
			c := (col + dc + b.width) % b.width

			if b.Cells[b.getIndex(r, c)] == 1 {
				count++
			}
		}
	}

	return count
}

func (b *Board) getIndex(row, col int) int {
	return row*b.width + col
}
