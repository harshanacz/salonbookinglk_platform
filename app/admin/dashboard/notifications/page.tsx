"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Notification = {
  notificationId: number;
  userName: string;
  message: string;
  dateSent: string;
};

export default function ClientTable() {
  const [clients, setClients] = useState<Notification[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [dateFilter, setDateFilter] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 10;

  useEffect(() => {
    fetch("/notifications.json")
      .then((response) => response.json())
      .then((data: Notification[]) => setClients(data))
      .catch((error) => console.error("Error fetching clients:", error));
  }, []);

  const filteredClients = clients.filter((client) => {
    const matchesSearch = Object.values(client).some((value) =>
      value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    );
    const matchesDate = dateFilter
      ? client.dateSent.startsWith(dateFilter)
      : true;
    return matchesSearch && matchesDate;
  });

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentClients = filteredClients.slice(
    indexOfFirstItem,
    indexOfLastItem
  );
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);

  return (
    <div className="flex flex-col">
      <div className="ml-2 p-5 font-normal text-lg md:ml-28 md:text-xl">
        Notifications
      </div>

      <div className="container mx-auto p-4 bg-white rounded-lg w-full md:w-4/5 flex flex-col overflow-auto max-h-[80vh] ">
        <div className="mb-4 flex gap-4 flex-wrap md:flex-nowrap">
          <Input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-3/4 focus:outline-none focus:ring-0 bg-[#F5F5F5] border-none rounded-xl"
          />
          <Input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="w-full md:w-1/4 focus:outline-none focus:ring-0 bg-[#F5F5F5] border-none rounded-xl"
          />
        </div>

        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client Name</TableHead>
                <TableHead>Details</TableHead>
                <TableHead>Date & Time</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentClients.map(
                ({ notificationId, userName, message, dateSent }) => (
                  <TableRow key={notificationId}>
                    <TableCell className="w-40">{userName}</TableCell>
                    <TableCell>{message}</TableCell>
                    <TableCell>{dateSent}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
        </div>

        <div className="mt-4 flex flex-wrap justify-between items-center gap-4">
          <div className="flex gap-4">
            <Link href="/admin/dashboard/notifications/create">
              <Button >
                CREATE
              </Button>
            </Link>
            <Link href="/admin/dashboard/notifications/send">
            <Button >
              SEND NOTIFICATIONS
            </Button>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="ghost"
              style={{ color: "var(--primary)" }}
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span>{currentPage}</span>
            <Button variant="ghost"
              className="text-[var(--secondary)]"
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
