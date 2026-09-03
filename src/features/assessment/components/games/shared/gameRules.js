export const GAME_RULES = {
  zip: {
    title: "How To Play Zip",
    steps: [
      "Start by clicking and dragging from the number <b>1</b> checkpoint.",
      "Drag through the grid to connect numbers in strict ascending order (1, 2, 3...).",
      "Movement is strictly horizontal or vertical between adjacent cells.",
      "You <b>cannot cross black wall barriers</b>.",
      "Every single cell in the grid must be visited exactly once to complete the puzzle.",
      "Drag backwards onto an existing path step to rewind/undo.",
    ],
  },
  tango: {
    title: "How To Play Tango",
    steps: [
      "Fill every grid cell using <b>Sun (🟡)</b> and <b>Moon (🌙)</b> symbols.",
      "Each <b>row</b> and <b>column</b> must have an equal number of Suns and Moons (3 of each in a 6x6 grid).",
      "No <b>3 consecutive identical symbols</b> are allowed horizontally or vertically.",
      "Shaded/bordered cells are pre-filled clues and cannot be modified.",
      "Click or tap an empty cell to cycle: <b>Empty → Sun (🟡) → Moon (🌙) → Empty</b>.",
      "<b>✖️ Red × badge:</b> The two touching cells must contain <b>different</b> symbols.",
      "<b>🟰 Green = badge:</b> The two touching cells must contain the <b>same</b> symbol.",
    ],
  },
  sudoku: {
    title: "How To Play Mini Sudoku",
    steps: [
      "Fill empty cells with digits from <b>1 to 6</b>.",
      "Each <b>row</b> must contain unique numbers from 1 to 6.",
      "Each <b>column</b> must contain unique numbers from 1 to 6.",
      "Each <b>2x3 rectangular block</b> must contain unique numbers from 1 to 6.",
      "Conflicting cells are automatically highlighted in red.",
      "Use the number pad below or keyboard numbers (1-6) to input values.",
    ],
  },
  mahjong: {
    title: "How To Play Mahjong",
    steps: [
      "Identify two tiles with <b>identical designs</b>.",
      "Tiles can match if they are <b>adjacent</b> or have an <b>unblocked straight line of sight</b> in the same row or column.",
      "You can also <b>slide tiles</b> towards empty spaces to align matching pairs.",
      "Quick successive matches trigger <b>Combo Multipliers</b> for higher scores!",
      "Use <b>Hint</b> to highlight an available match, or <b>Shuffle</b> when stuck.",
      "Clear all tiles from the board to achieve 100% completion!",
    ],
  },
};
