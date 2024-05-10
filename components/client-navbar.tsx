// ClientNavbar.tsx
"use client";
import { MainNav } from "@/components/main-nav";
import StoreSwitcher from "./store-switcher";
import { UserButton } from "@clerk/nextjs";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";

export const ClientNavbar = ({ stores }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);

  const handleClick = () => {
    setIsDisabled(true);
    setIsOpen(!isOpen);
    setTimeout(() => setIsDisabled(false), 300); // Ajusta este valor según la duración de la animación
  };


  const handleLinkClick = () => {
    setIsOpen(false);
  }

  // Cierra el menú cuando la pantalla es grande
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 640) {
        setIsOpen(false);
      }
    };

    

    window.addEventListener("resize", handleResize);

    // Limpia el controlador de eventos cuando el componente se desmonta
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div className="border-b bg-[#252440] dark:bg-[#0D1A26] text-[#FFD700]">
      <div className="flex h-16 items-center px-4 flex-col sm:flex-row sm:justify-between">
        <div className="flex flex-col items-start sm:items-center sm:space-y-2  sm:flex-row sm:mt-[-8px]">
          <StoreSwitcher items={stores} className="mb-2 sm:mb-0" />
        </div>
        <div className="ml-auto flex items-center space-x-4 sm:block">
          <ThemeToggle />
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
      <button
        className="sm:hidden block"
        onClick={handleClick}
        disabled={isDisabled}
      >
        {isOpen ? <X /> : <Menu />}
      </button>
      {isOpen && (
        <div className="fixed top-0 left-0 h-full w-full bg-black bg-opacity-50 z-50">
          <div className="h-full w-64 bg-[#252440] dark:bg-[#0d1a26] p-4">
          <button
              className="absolute top-4 right-4 text-[#FFD700] dark:text-[#252440] hover:text-gray-300 dark:hover:text-gray-800"
              onClick={handleClick}
            >
              <X />
            </button>
            <MainNav isOpen={isOpen} onClick={handleLinkClick}/>
          </div>
        </div>
      )}
      <MainNav
        isOpen={isOpen}
        className={`${
          isOpen ? "block sm:hidden" : "hidden sm:flex"
        } flex-col sm:flex-row sm:w-auto sm:mx-6 mb-2 sm:mb-0 `}
      />
    </div>
  );
};
