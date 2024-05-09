"use client";

import { Poppins } from "next/font/google";

import { useStoreModal } from "@/hooks/use-store-modal";
import { useEffect } from "react";


const font = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});
const SetUpPage = () => {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) onOpen();
  }, [isOpen, onOpen]);

  return null;
};

export default SetUpPage;
