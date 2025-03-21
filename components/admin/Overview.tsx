"use client";
import { BadgeCheck, Bell } from "lucide-react";


import Link from "next/link";

const Overview = () => {

  return (
    <div>
      <div className="h-16 rounded-2xl flex flex-row items-center justify-between bg-white my-2 border">
        <div className="m-5 flex items-center">
            <span className="text-lg font-bold m-5 sm:text-xl md:text-2xl">Admin Dashboard</span>
        </div>
        <div className="flex flex-row mr-12 text-3xl gap-10 relative">
          <div className="relative">
            <Link href="/admin/dashboard/verify">
                <BadgeCheck />
            </Link>

            <span className="absolute top-[-12px] right-[-5px] bg-[var(--primary2)] text-white rounded-full text-base font-medium w-5 h-5 flex items-center justify-center">
              3
            </span>
          </div>
          <div className="relative">
            <Link href="/admin/dashboard/notifications">
                <Bell />
            </Link>
            <span className="absolute top-[-12px] right-[-5px] bg-[var(--primary2)] text-white rounded-full text-base font-medium w-5 h-5 flex items-center justify-center">
              5
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Overview;
