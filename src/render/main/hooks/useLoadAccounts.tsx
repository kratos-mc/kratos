import { useDispatch } from "react-redux";
import { setAccounts } from "../slices/AppSlice";
import { useEffect } from "react";

export default function useLoadAccounts(): [] {
  const dispatch = useDispatch();
  // Initial load
  useEffect(() => {
    window.account.getAccounts().then((accounts) => {
      dispatch(setAccounts(accounts));
    });
  }, []);

  return [];
}
