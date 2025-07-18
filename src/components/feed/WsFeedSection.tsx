"use client";
import MessageTable from "./MessageTable";

export default function WsFeedSection() {  
  return (
    <>
        <div className="flex flex-col mt-8">
            <h2 className="text-xl font-bold mb-4">Incoming Messages</h2>
            <MessageTable />
        </div>
    </>
  );
}
