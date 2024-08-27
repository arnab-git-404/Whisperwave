"use client";

import React, { useEffect, useState } from "react";
import axios, { AxiosError } from "axios";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Loader2, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CardHeader, CardContent, Card } from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import * as z from "zod";
import { ApiResponse } from "@/customTypes/ApiResponse";
import Link from "next/link";
import { useParams } from "next/navigation";
import { messageSchema } from "@/schemas/messageSchema.ts";

const specialChar = "||";

const parseStringMessages = (messageString: string): string[] => {
  console.log("showing ", messageString.split(specialChar));
  return messageString.split(specialChar);
};

const initialMessageString =
  "What's your favorite movie?||Do you have any pets?||What's your dream job?";

export default function SendMessage() {
  const params = useParams<{ username: string }>();
  const username = params.username;

  const form = useForm<z.infer<typeof messageSchema>>({
    resolver: zodResolver(messageSchema),
  });

  const messageContent = form.watch("content");

  const handleMessageClick = (message: string) => {
    form.setValue("content", message);
  };

  const [isLoading, setIsLoading] = useState(false);

  const onSubmit = async (data: z.infer<typeof messageSchema>) => {
    setIsLoading(true);
    try {
      const response = await axios.post<ApiResponse>("/api/send-message", {
        ...data,
        username,
      });

      toast({
        title: response.data.message,
        variant: "default",
      });
      form.reset({ ...form.getValues(), content: "" });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to sent message",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const [aimessages, setAiMessages] = useState<string[]>([]);

  const [isQuestionGetting, setIsQuestionGetting] = useState(false);

  const fetchSuggestedMessages = async () => {
    try {
      setAiMessages([]);
      setIsQuestionGetting(true);
      const response = await axios.post("/api/suggest-messages");
      if(response){
        setIsQuestionGetting(false);
      }

      setAiMessages(response.data);
      
      
    } catch (error) {
      console.error("Error fetching messages:", error);
      // Handle error appropriately
    }
  };

  return (
<div className="container  mx-auto p-6 rounded max-w-4xl ">
  <h1 className="text-3xl sm:text-4xl font-bold mb-6 text-center">
    Public Profile Link
  </h1>
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
      <FormField
        control={form.control}
        name="content"
        render={({ field }) => (
          <FormItem>
            
            <p className="mb-4  text-center font-semibold  ">Send Anonymous Message to <span className="">{username}</span> </p>
            <FormControl>
              <Textarea
                placeholder="Write your anonymous message here"
                className="resize-none w-full "
                {...field}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <div className="flex justify-center">
        {isLoading ? (
          <Button disabled>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Please wait
          </Button>
        ) : (
          <Button type="submit" disabled={isLoading || !messageContent}>
            Send It
          </Button>
        )}
      </div>
    </form>
  </Form>

  <div className="space-y-4 my-8 ">
    <div className="space-y-2 text-center">
      <Button
        onClick={fetchSuggestedMessages}
        className="my-4"
        // disabled={isSuggestLoading}
      >
        Suggest Messages
      </Button>
      <p className="font-semibold" >Click on any message below to select it.</p>
    </div>
    <Card>
      <CardHeader>
        <h3 className="text-lg sm:text-xl font-semibold">Messages</h3>
      </CardHeader>

      <CardContent className="flex flex-col space-y-4">
        {parseStringMessages(
          aimessages.length > 0 ? aimessages : (isQuestionGetting ? "" : initialMessageString)
        ).map((message, index) => (
          <Button 
            key={index}
            variant="outline"
            className=" mb-2 w-full md:w-auto truncate h-fit"
            onClick={() => handleMessageClick(message)}
          >
            {isQuestionGetting && <Loader2 className="h-5 w-5 animate-spin mr-2" />}
            <span className="whitespace-normal break-words">{message}</span>
          </Button>
        ))}
      </CardContent>
    </Card>
  </div>
  <Separator className="my-6" />
  <div className="text-center">
    <div className="mb-4 text-lg font-semibold">Get Your Message Board</div>
    <Link href={"/sign-up"}>
      <Button>Create Your Account</Button>
    </Link>
  </div>
</div>

  );
}
