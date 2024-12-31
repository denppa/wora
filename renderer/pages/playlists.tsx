import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { IconArrowRight, IconPlus, IconX } from "@tabler/icons-react";
import { useRouter } from "next/router";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/ui/spinner";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Playlist name must be at least 2 characters.",
  }),
  description: z.string().optional(),
  playlistCover: z.any().optional(),
});

export default function Playlists() {
  const router = useRouter();
  const [playlists, setPlaylists] = useState([]);
  const [previewUrl, setPreviewUrl] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    window.ipc.invoke("getAllPlaylists").then((response) => {
      setPlaylists(response);
    });
  }, []);

  const createPlaylist = async (data: z.infer<typeof formSchema>) => {
    setLoading(true);

    let playlistCoverPath: any = null;

    if (
      data.playlistCover &&
      data.playlistCover instanceof FileList &&
      data.playlistCover.length > 0
    ) {
      const file = data.playlistCover[0];
      const fileData = await file.arrayBuffer();
      try {
        playlistCoverPath = await window.ipc.invoke("uploadPlaylistCover", {
          name: file.name,
          data: Array.from(new Uint8Array(fileData)),
        });
      } catch (error) {
        console.error("Error uploading playlist cover:", error);
        toast(
          <div className="flex w-fit items-center gap-2 text-xs">
            <IconX className="text-red-500" stroke={2} size={16} />
            Failed to upload playlist cover. Using default picture.
          </div>,
        );
        // Fallback to the original profile picture
        playlistCoverPath = null;
      }
    } else {
      // No new file selected, use the existing profile picture
      playlistCoverPath = null;
    }

    const updatedData = {
      name: data.name,
      description: data.description,
      cover: playlistCoverPath,
    };

    window.ipc
      .invoke("createPlaylist", updatedData)
      .then((response) => {
        setDialogOpen(false);
        setLoading(false);
        router.push(`/playlists/${response.lastInsertRowid}`);
      })
      .catch(() => setLoading(false));
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-8">
        <div className="flex w-full items-center justify-between">
          <div className="flex flex-col">
            <div className="mt-4 text-lg font-medium leading-6">Playlists</div>
            <div className="opacity-50">
              Most awesome, epic playlists created by you.
            </div>
          </div>
          <Button variant="default" onClick={() => setDialogOpen(true)}>
            Create Playlist <IconPlus size={14} />
          </Button>
        </div>
        <div className="grid w-full grid-cols-5 gap-8">
          {playlists &&
            playlists.map((playlist) => (
              <Link
                key={playlist.id}
                href={`/playlists/${playlist.id}`}
                passHref
              >
                <div className="group/album wora-border wora-transition rounded-2xl p-5 hover:bg-black/5 dark:hover:bg-white/10">
                  <div className="relative flex flex-col justify-between">
                    <div className="relative w-full overflow-hidden rounded-xl pb-[100%] shadow-lg">
                      <Image
                        alt={playlist ? playlist.name : "Album Cover"}
                        src={
                          playlist.id === 1
                            ? "/favouritesCoverArt.png"
                            : playlist.cover
                              ? "wora://" + playlist.cover
                              : "/coverArt.png"
                        }
                        fill
                        loading="lazy"
                        className="z-10 object-cover"
                      />
                    </div>
                    <div className="mt-8 flex w-full flex-col overflow-clip">
                      <p className="text-nowrap text-sm font-medium gradient-mask-r-70">
                        {playlist.name}
                      </p>
                      <p className="text-nowrap opacity-50 gradient-mask-r-70">
                        {playlist.description}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
        </div>
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <div className="flex h-full w-full items-start gap-6">
            <div className="jusitfy-between flex h-full w-full flex-col gap-4">
              <DialogHeader>
                <DialogTitle>Create Playlist</DialogTitle>
                <DialogDescription>
                  Add a new playlist to your library.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(createPlaylist)}
                  className="flex gap-4 text-xs"
                >
                  <div className="h-full">
                    <div className="relative h-36 w-36 overflow-hidden rounded-xl shadow-lg">
                      <Label
                        className="wora-transition w-fit cursor-pointer hover:opacity-50"
                        htmlFor="playlistCover"
                      >
                        <div className="relative h-36 w-36 overflow-hidden rounded-lg shadow-lg">
                          <Image
                            alt="album"
                            src={previewUrl || "/coverArt.png"}
                            fill
                            className="object-cover"
                          />
                        </div>
                      </Label>
                      <FormField
                        control={form.control}
                        name="playlistCover"
                        render={({ field: { onChange, value, ...rest } }) => {
                          const fileInputRef = useRef<HTMLInputElement>(null);
                          return (
                            <FormItem hidden className="w-full">
                              <FormControl>
                                <Input
                                  id="playlistCover"
                                  placeholder="Picture"
                                  type="file"
                                  accept="image/*"
                                  onChange={(e) => {
                                    const files = e.target.files;
                                    if (files && files.length > 0) {
                                      const file = files[0];
                                      onChange(files);
                                      const objectUrl =
                                        URL.createObjectURL(file);
                                      setPreviewUrl(objectUrl);
                                    }
                                  }}
                                  ref={fileInputRef}
                                  {...rest}
                                />
                              </FormControl>
                              <FormMessage className="text-xs" />
                            </FormItem>
                          );
                        }}
                      />
                    </div>
                  </div>
                  <div className="flex h-full w-full flex-col items-end justify-between gap-4">
                    <div className="flex w-full flex-col gap-2">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Input placeholder="Name" {...field} />
                            </FormControl>
                            <FormMessage className="text-xs" />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormControl>
                              <Input placeholder="Description" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button
                      className="w-fit justify-between text-xs"
                      type="submit"
                    >
                      Create Playlist
                      {loading ? (
                        <Spinner className="h-3.5 w-3.5" />
                      ) : (
                        <IconArrowRight stroke={2} className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
