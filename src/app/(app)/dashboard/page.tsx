"use client";

import { MessageCard } from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Message } from "@/model/User";
import { ApiResponse } from "@/customTypes/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { useRouter } from "next/navigation";

function UserDashboard() {
  const { data: session, status } = useSession();

  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);
  const [count, setCount] = useState(3);

  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;

  const acceptMessages = watch("acceptMessages");

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get("api/check-acceptance-status");

      console.log("yaaa test haa'", response.data.isAcceptingMessage);
      setValue("acceptMessages", response.data.isAcceptingMessage);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      console.log(axiosError.response);
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ??
          "Failed to fetch message settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get("/api/get-messages");
        setMessages(response.data.message || []);
        if (refresh) {
          toast({
            title: "Refreshed Messages",
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description:
            axiosError.response?.data.message ?? "Failed to fetch messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages, toast]
  );

  useEffect(() => {
    if (status === "authenticated") {
      console.log("Fetching initial state from the server...");

      fetchMessages();
      fetchAcceptMessages();
    }
  }, [status, fetchMessages, fetchAcceptMessages]);

  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast({
        title: response.data.message,
        variant: "default",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ??
          "Failed to update message settings",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      toast({
        title: "Login Required",
        description: "Please log in / Sign Up to access Dashboard",
        variant: "destructive",
       
      });

      const timer = setInterval(() => {
        setCount((prevCount) => {
          if (prevCount === 1) {
            clearInterval(timer);
            router.replace("/sign-in");
            return 0;
          }
          return prevCount - 1;
        });
      }, 1000); // Countdown every second

      // Cleanup interval on component unmount
      return () => clearInterval(timer);
    }
  }, [status, toast, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 md:px-8">
        <div className="bg-gradient-to-r from-blue-50 to-blue-200 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-lg md:max-w-2xl flex items-center justify-center">
          <div className="flex flex-col items-center space-y-6">
            <svg
              className="w-12 h-12 md:w-16 md:h-16 text-blue-700 animate-spin"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V1a10 10 0 00-10 10h2z"
              ></path>
            </svg>
            <div className="text-center">
              <span className="text-gray-800 text-lg md:text-2xl font-semibold">
                Loading, please wait...
              </span>
              <p className="text-gray-600 text-sm md:text-base mt-2">
                This might take a few moments. Thank you for your patience.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-purple-500 via-pink-500 to-red-500 px-4 sm:px-6 md:px-8">
        <div className="bg-white p-8 md:p-10 rounded-3xl shadow-xl w-full max-w-lg md:max-w-2xl text-center">
          <div className="text-5xl md:text-7xl font-extrabold text-gray-800">
            {count}
          </div>
          <p className="mt-4 text-lg md:text-xl text-gray-600">
            Redirecting to the sign-in page...
          </p>
        </div>
      </div>
    );
  }

  const { username } = session?.user as User;
  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "URL Copied!",
      description: "Profile URL has been copied to clipboard.",
    });
  };

  return (
    <div className="my-8 md:mx-auto lg:mx-auto p-6 rounded w-full max-w-6xl">
      <h1 className="text-2xl md:text-4xl font-bold mb-4  ">User Dashboard</h1>
      <div className="mb-4">
        <h2 className="text-base md:text-lg font-semibold mb-2">
          Copy Your Unique Link
        </h2>
        <div className="flex flex-col md:flex-row items-center">
          <input
            type="text"
            value={profileUrl}
            disabled
            className="input input-bordered w-full p-2 mb-2 md:mb-0 md:mr-2 h-fit "
          />
          <Button onClick={copyToClipboard} className="w-full md:w-auto">
            Copy
          </Button>
        </div>
      </div>

      <div className="mb-4 flex items-center">
        <Switch
          {...register("acceptMessages")}
          checked={acceptMessages}
          onCheckedChange={handleSwitchChange}
          disabled={isSwitchLoading}
        />
        <span className="ml-2 text-sm md:text-base">
          Accept Messages: {acceptMessages ? "On" : "Off"}
        </span>
      </div>

      <Separator />

      <Button
        className="mt-4 w-full md:w-auto"
        variant="outline"
        onClick={(e) => {
          e.preventDefault();
          fetchMessages(true);
        }}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <RefreshCcw className="h-4 w-4" />
        )}
      </Button>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
        {messages.length > 0 ? (
          messages.map((message) => (
            <MessageCard
              key={message._id}
              message={message}
              onMessageDelete={handleDeleteMessage}
            />
          ))
        ) : (
          <p className="font-semibold">
            No messages to display.
          </p>
        )}
      </div>

    </div>
  );
}

export default UserDashboard;
