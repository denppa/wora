import { IconArrowDownRight, IconX } from "@tabler/icons-react";
import Image from "next/image";
import { Button } from "../ui/button";

function Actions() {
  const closeWindow = () => {
    window.ipc.send("closeApp", 1);
  };

  const minimizeWindow = () => {
    window.ipc.send("minimizeApp", 1);
  };

  return (
    <div className="drag absolute top-0 z-50 flex w-full items-center justify-end px-8 py-2.5">
      <div className="flex w-full items-center justify-between">
        <div></div>
        <div className="flex items-center gap-2">
          <Image
            src={"/assets/Logo.ico"}
            className="block dark:hidden"
            alt="logo"
            width={16}
            height={16}
          />
          <Image
            src={"/assets/Logo [Dark].ico"}
            className="hidden dark:block"
            alt="logo"
            width={16}
            height={16}
          />
          Wora v0.1.0-alpha
        </div>
        <div className="no-drag mt-0.5 flex items-center gap-3">
          <Button variant="ghost" onClick={minimizeWindow}>
            <IconArrowDownRight className="w-3.5" stroke={2} />
          </Button>
          <Button variant="ghost" onClick={closeWindow}>
            <IconX className="w-3.5" stroke={2} />
          </Button>
        </div>
      </div>
    </div>
  );
}

export default Actions;
