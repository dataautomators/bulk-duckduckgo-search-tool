"use client";

import { addSearches } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import useFingerprint from "@/hooks/useFingerprint";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const formSchema = z.object({
  queries: z.string().nonempty("Query cannot be empty"),
});

export default function SearchForm() {
  const { fingerprint } = useFingerprint();
  const [loading, setLoading] = useState(false);
  const [stopping, setStopping] = useState(false);
  const processRef = useRef<Promise<void> | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      queries: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setLoading(true);
    setStopping(false);
    const formattedQueries = values.queries
      .split("\n")
      .map((query) => query.trim())
      .filter(Boolean);

    processRef.current = new Promise(async (resolve) => {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      if (stopping) {
        console.log("Processing stopped.");
        return;
      }
      await addSearches({ queries: formattedQueries, fingerprint: fingerprint! });
      resolve();
    });

    try {
      await processRef.current;
    } catch (error) {
      console.error("Error during processing:", error);
    } finally {
      setLoading(false);
      form.reset();
      processRef.current = null;
    }
  };

  const handleStopProcessing = () => {
    if (processRef.current) {
      console.log("Stopping processing...");
      setStopping(true);
      processRef.current = null;
      setLoading(false);
    }
  };

  return (
    <div className="mb-4 p-6 shadow-md rounded-lg w-full max-w-5xl space-y-4">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <FormField
            control={form.control}
            name="queries"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Enter search queries (one per line):</FormLabel>
                <FormControl>
                  <Textarea rows={10} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="flex justify-center space-x-4 mb-4">
            <Button disabled={loading} type="submit">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                'Process'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}