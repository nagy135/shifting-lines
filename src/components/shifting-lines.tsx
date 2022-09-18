import { cellHeight, cellSize, REFRESH_WAIT } from "@constants/global";
import { CSSProperties, FC, useCallback, useState } from "react";

interface IShiftingLines {
  grid: number[][];
  colorSetup: TColorSetup;
}

const style: CSSProperties = {
  position: "absolute",
  backgroundColor: "white",
  width: cellSize,
  height: cellHeight,
};

export type TColorSetup = {
  baseChoices: string[];
  backgroundLines: string;
  background: string;
};

const siblingExists = (grid: number[][], x: number, y: number): boolean => {
  if (grid.length > y) {
    if (grid[0].length > x) {
      if (grid[y][x]) return true;
    }
  }
  return false;
};

const colorCache: Record<string, string> = {};
const getCellColor = (
  x: number,
  y: number,
  val: number,
  colorSetup: TColorSetup
): string => {
  if (val == 0) return "";
  if (val == 2) return colorSetup.backgroundLines;

  const leftSiblingIndex = `${x - 1}x${y}`;
  const rightSiblingIndex = `${x + 1}x${y}`;

  const colorChoice =
    leftSiblingIndex in colorCache
      ? colorCache[leftSiblingIndex]
      : rightSiblingIndex in colorCache
      ? colorCache[rightSiblingIndex]
      : colorSetup.baseChoices[
          Math.floor(Math.random() * colorSetup.baseChoices.length)
        ];
  colorCache[`${x}x${y}`] = colorChoice;
  return colorChoice;
};

const globalOffset = [20, 20];

const ShiftingLines: FC<IShiftingLines> = ({ grid, colorSetup }) => {
  const [animating, setAnimating] = useState(false);
  const [offsets, setOffsets] = useState(grid.map(() => 0));

  const maxWidth = cellSize*grid[0].length;

  const handleClick = useCallback(() => {
    if (animating) return;
    setAnimating(true);

    setInterval(() => {
      setOffsets((prev) => prev.map((e, i) => (i % 2 ? e + 1 : e - 1)));
    }, REFRESH_WAIT);
  }, [offsets, animating]);

  return (
    <div
      className="app"
      style={{
        backgroundColor: colorSetup.background,
        width: grid[0].length * cellSize + globalOffset[0],
        height: grid.length * 2 * cellHeight + globalOffset[1],
      }}
      onClick={() => handleClick()}
    >
      {grid.map((row, y) => {
        return (
          <>
            {row.map((val, x) => {
              const hasRightSibling = siblingExists(grid, x + 1, y);
              const hasLeftSibling = siblingExists(grid, x - 1, y);
              const color = getCellColor(x, y, val, colorSetup);

              const newX = (x * cellSize + globalOffset[0] + offsets[y]) % maxWidth;

              return (
                <div
                  key={`cell-${x}x${y}`}
                  style={{
                    ...style,
                    top: 2*y * cellHeight + globalOffset[1],
                    left: newX > 0 ? newX : newX+maxWidth,
                    borderTopLeftRadius: !hasLeftSibling ? 15 : undefined,
                    borderBottomLeftRadius: !hasLeftSibling ? 15 : undefined,

                    borderTopRightRadius: !hasRightSibling ? 15 : undefined,
                    borderBottomRightRadius: !hasRightSibling ? 15 : undefined,
                    background: color,
                  }}
                />
              );
            })}
          </>
        );
      })}
    </div>
  );
};

export default ShiftingLines;
