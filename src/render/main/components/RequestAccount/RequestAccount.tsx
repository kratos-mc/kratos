import classNames from "classnames";
import React, { useState } from "react";
import Input from "../Input/Input";
import Button from "../Button/Button";
import { EventHandler } from "react";
import { ChangeEvent } from "react";
import { ChangeEventHandler } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setAccounts } from "../../slices/AppSlice";
import { RootState } from "../../stores/RenderStore";

export default function RequestAccount() {
  const [username, setUsername] = useState("");
  const dispatch = useDispatch();
  const accounts = useSelector((state: RootState) => state.app.accounts);

  const handleUsernameInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setUsername(e.target.value);
  };

  const handleUsernameCreateClick = () => {
    if (username === "") {
      throw new Error(`Username is undefined`);
    }
    let pattern = new RegExp("^[a-zA-Z0-9_]{2,16}$");
    if (!pattern.test(username)) {
      throw new Error(
        `Invalid username. The username must be in the min length of 2 and only contains underscore(_).`
      );
    }
    // TODO: add create user
    window.account.createAccount(username).then((responseId) => {
      dispatch(setAccounts([...accounts, { id: responseId, name: username }]));
    });
  };

  return (
    <div
      className={classNames(
        `w-[100vw] h-[calc(100vh-36px)]`,
        `bg-white dark:bg-neutral-900 dark:text-neutral-100`,
        `rounded-lg`,
        `flex flex-col`,
        `place-items-center`,
        `justify-center`
      )}
    >
      {/* Select dialog */}
      <div className="w-1/2 flex flex-col gap-4">
        <h1 className="text-3xl">Before you go</h1>

        <Input
          placeholder="Username"
          value={username}
          onChange={handleUsernameInputChange}
        />

        {/* Footer */}
        <div className="flex flex-row-reverse">
          <Button
            size="sm"
            level="primary"
            className={classNames(`w-1/3`, `uppercase`)}
            disabled={username === "" || username.length < 3}
            onClick={handleUsernameCreateClick}
          >
            Start
          </Button>
        </div>
      </div>
    </div>
  );
}
