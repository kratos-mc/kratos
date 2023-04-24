import React, {
  DetailedHTMLProps,
  HTMLAttributes,
  useRef,
  useState,
} from "react";
import classnames from "classnames";
import { useOnClickOutside } from "../../hooks/useOnClickOutside";
import Input from "../Input/Input";

interface SelectorItemProps {
  disabled?: boolean;
  children: any;
  onClick?: (e) => void;
}

function SelectorItem({ disabled, children, onClick }: SelectorItemProps) {
  const didDisabledNotUndefined = () => {
    return disabled !== undefined;
  };

  return (
    <div
      className={classnames(
        `px-4 py-2`,
        `select-none`,
        {
          "hover:bg-neutral-300 dark:hover:bg-neutral-600":
            !didDisabledNotUndefined() || disabled === false,
        },
        {
          "text-neutral-500": didDisabledNotUndefined() && disabled === true,
          "cursor-default": didDisabledNotUndefined() && disabled === true,
        }
      )}
      tabIndex={0}
      onClick={(e) => {
        if (disabled !== undefined && disabled === true) {
          return;
        }

        if (onClick !== undefined) {
          onClick(e);
        }
      }}
    >
      {children}
    </div>
  );
}

export interface SelectorPropsDataItem {
  text: string;
  id: string;
  disabled?: boolean;
}

export interface SelectorProps {
  placeholder?: string;

  currentItem?: SelectorPropsDataItem;
  onSelectItem: (item: SelectorPropsDataItem) => void;
  items: SelectorPropsDataItem[];
}

export default function Selector({
  currentItem,
  onSelectItem,
  placeholder,
  items,
}: SelectorProps) {
  const [dropdownVisible, setDropdownVisible] = useState<boolean>(false);
  const [didSelected, setDidSelected] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  // const [currentSelect, setCurrentSelect] = useState<
  //   SelectorPropsDataItem | undefined
  // >(undefined);

  const ref = useRef(null);
  useOnClickOutside(ref, () => {
    setDropdownVisible(false);
  });

  const handleVisibleDropdown = () => {
    setDropdownVisible(true);
  };

  const handleSearchVersion = (e) => {
    // Disable if the selector is selected
    if (didSelected) {
      setDidSelected(false);
    }

    setSearchValue(e.target.value);
  };

  const handleOnSelect = (item: SelectorPropsDataItem) => {
    // setCurrentSelect(item);
    onSelectItem(item);

    setSearchValue("");
    setDidSelected(true);

    setDropdownVisible(false);
  };

  return (
    <div className={classnames(`selector`, `relative`)}>
      {/* The input represents searchable components */}
      <Input
        placeholder={placeholder || `Select your item`}
        value={
          didSelected
            ? currentItem
              ? currentItem.text
              : "undefined"
            : searchValue
        }
        onFocus={handleVisibleDropdown}
        onInput={handleSearchVersion}
      />

      <div className={classnames(`relative`)}>
        {dropdownVisible && (
          <div
            className={classnames(
              `flex flex-col absolute bg-neutral-200 w-full top-0 left-0 max-h-[30vh] overflow-y-auto`,
              "rounded-md",
              "shadow-md",
              "border border-neutral-400",
              "dark:bg-neutral-800",
              "dark:text-neutral-300",
              "dark:border-neutral-500"
            )}
            ref={ref}
          >
            {items === undefined ||
            items.filter((item) => {
              return item.text.includes(searchValue);
            }).length === 0 ? (
              <SelectorItem disabled={true}>There are no items</SelectorItem>
            ) : (
              items
                .filter((item) => {
                  return item.text.includes(searchValue);
                })
                .map((item, _index) => {
                  return (
                    <SelectorItem
                      disabled={
                        item.disabled !== undefined && item.disabled === true
                      }
                      key={item.id}
                      onClick={(_e) => {
                        handleOnSelect(item);
                      }}
                    >
                      {item.id}
                    </SelectorItem>
                  );
                })
            )}
          </div>
        )}
      </div>
    </div>
  );
}
