import { StrictMode, useState } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { DoubleSlide } from "./rangeSlide";

const levels = [
  { level: 1, label: "初學" },
  { level: 5, label: "中階" },
  { level: 10, label: "高階" },
];

test("缺級時只選有效整數、顯示 label，兩個實例同步且能清理", () => {
  let selected;
  function Harness() {
    const [value, setValue] = useState([1, 10]);
    selected = value;
    return <>
      <DoubleSlide levels={levels} value={value} onChange={setValue} />
      <DoubleSlide levels={levels} value={value} onChange={setValue} />
      <button onClick={() => setValue([1, 10])}>重設</button>
    </>;
  }
  const view = render(<StrictMode><Harness /></StrictMode>);
  expect(screen.getAllByText("初學")).toHaveLength(2);
  fireEvent.keyDown(screen.getAllByRole("slider")[0], { key: "ArrowRight" });
  expect(selected).toEqual([5, 10]);
  expect(screen.getAllByText("中階")).toHaveLength(2);
  expect(Number(screen.getAllByRole("slider")[2].getAttribute("aria-valuenow"))).toBe(5);
  fireEvent.click(screen.getByText("重設"));
  expect(Number(screen.getAllByRole("slider")[0].getAttribute("aria-valuenow"))).toBe(1);
  view.unmount();
  expect(window.$hsRangeSliderCollection).toHaveLength(0);
});

test("只有一級時顯示名稱，不建立零長度滑桿", () => {
  render(<DoubleSlide levels={[levels[1]]} value={[5, 5]} onChange={jest.fn()} />);
  expect(screen.getAllByText("中階")).toHaveLength(2);
  expect(screen.queryAllByRole("slider")).toHaveLength(0);
});

test("未指定選值時以程度表的真正最小最大值初始化，顯示對應 label", () => {
  render(<DoubleSlide levels={[
    { level: 18, label: "高手" },
    { level: 3, label: "新手" },
    { level: 8, label: "熟練" },
  ]} onChange={jest.fn()} />);
  const handles = screen.getAllByRole("slider");
  expect(Number(handles[0].getAttribute("aria-valuenow"))).toBe(3);
  expect(Number(handles[1].getAttribute("aria-valuenow"))).toBe(18);
  expect(screen.getByText("新手")).toBeTruthy();
  expect(screen.getByText("高手")).toBeTruthy();
});

test("沒有程度表時不顯示固定範圍的 Slider", () => {
  render(<DoubleSlide levels={[]} onChange={jest.fn()} />);
  expect(screen.queryAllByRole("slider")).toHaveLength(0);
  expect(screen.getByText("此球類尚未設定程度")).toBeTruthy();
});
