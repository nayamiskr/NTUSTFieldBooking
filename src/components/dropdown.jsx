import { Menu, MenuButton } from "@headlessui/react";

export function Dropdown({ options, onSelect }) {
    return (
        <Menu>
            <MenuButton className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
                選擇排序方式
            </MenuButton>
        </Menu>
    )
}