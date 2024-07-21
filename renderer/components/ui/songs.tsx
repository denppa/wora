import React, { useEffect, useState } from "react";
import Image from "next/image";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSub,
  ContextMenuSubTrigger,
  ContextMenuSubContent,
} from "@/components/ui/context-menu";
import {
  IconCheck,
  IconClock,
  IconPlayerPlay,
  IconPlus,
  IconX,
} from "@tabler/icons-react";
import { convertTime } from "@/lib/helpers";
import { usePlayer } from "@/context/playerContext";
import { toast } from "sonner";

type Album = {
  id: number;
  name: string;
  coverArt: string;
};

type Song = {
  id: number;
  name: string;
  filePath: string;
  artist: string;
  duration: number;
  album: Album;
};

type Playlist = {
  id: string;
  name: string;
};

type SongsProps = {
  library: Song[];
  renderAdditionalMenuItems?: (song: Song, index: number) => React.ReactNode;
};

const Songs: React.FC<SongsProps> = ({
  library,
  renderAdditionalMenuItems,
}) => {
  const { setQueueAndPlay } = usePlayer();
  const [playlists, setPlaylists] = useState<Playlist[]>([]);

  const handleMusicClick = (index: number) => {
    setQueueAndPlay(library, index);
  };

  useEffect(() => {
    window.ipc.invoke("getAllPlaylists").then((response) => {
      setPlaylists(response);
    });
  }, []);

  const addSongToPlaylist = (playlistId: number, songId: number) => {
    window.ipc
      .invoke("addSongToPlaylist", {
        playlistId,
        songId,
      })
      .then((response) => {
        if (response === true) {
          toast(
            <div className="flex w-fit items-center gap-2 text-xs">
              <IconCheck stroke={2} size={16} />
              Song is added to playlist.
            </div>,
          );
        } else {
          toast(
            <div className="flex w-fit items-center gap-2 text-xs">
              <IconX stroke={2} size={16} />
              Song already exists in playlist.
            </div>,
          );
        }
      });
  };

  return (
    <div className="flex w-full flex-col">
      {library &&
        library.map((song: Song, index: number) => (
          <ContextMenu key={song.id}>
            <ContextMenuTrigger>
              <div
                className="wora-transition flex w-full cursor-pointer items-center justify-between rounded-xl px-4 py-3 hover:bg-black/5 dark:hover:bg-white/10"
                onClick={() => handleMusicClick(index)}
              >
                <div className="flex items-center gap-4">
                  <div className="relative h-12 w-12 overflow-hidden rounded shadow-lg transition duration-300">
                    <Image
                      alt={song.album.name}
                      src={song.album.coverArt}
                      fill
                      loading="lazy"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-sm font-medium">{song.name}</p>
                    <p className="opacity-50">{song.artist}</p>
                  </div>
                </div>
                <div>
                  <p className="flex items-center gap-1 opacity-50">
                    <IconClock stroke={2} size={15} />
                    {convertTime(song.duration)}
                  </p>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="w-64">
              <ContextMenuItem
                className="flex items-center gap-2"
                onClick={() => handleMusicClick(index)}
              >
                <IconPlayerPlay className="fill-white" stroke={2} size={14} />
                Play Song
              </ContextMenuItem>
              <ContextMenuSub>
                <ContextMenuSubTrigger className="flex items-center gap-2">
                  <IconPlus stroke={2} size={14} />
                  Add to Playlist
                </ContextMenuSubTrigger>
                <ContextMenuSubContent className="w-52">
                  {playlists.map((playlist) => (
                    <ContextMenuItem
                      key={playlist.id}
                      onClick={() => addSongToPlaylist(playlist.id, song.id)}
                    >
                      <p className="w-full text-nowrap gradient-mask-r-70">
                        {playlist.name}
                      </p>
                    </ContextMenuItem>
                  ))}
                </ContextMenuSubContent>
              </ContextMenuSub>
              {renderAdditionalMenuItems &&
                renderAdditionalMenuItems(song, index)}
            </ContextMenuContent>
          </ContextMenu>
        ))}
    </div>
  );
};

export default Songs;
