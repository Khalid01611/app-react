import React from "react";
import type { IConversation } from "../../service/chatService";

interface ConversationListProps {
  conversations: IConversation[];
  currentConversation: IConversation | null;
  onConversationSelect: (conversationId: string) => void;
  onConversationDelete?: (conversationId: string) => void;
  loading: boolean;
  currentUserId: string;
  query?: string;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  currentConversation,
  onConversationSelect,
  onConversationDelete,
  loading,
  currentUserId,
  query = "",
}) => {
   const formatLastMessage = (message: any) => {
    if (!message) return "No messages yet";

    if (message.isDeleted) return "This message was deleted";

    switch (message.messageType) {
      case "image":
        return "📷 Image";
      case "file":
        return "📎 File";
      case "voice":
        return "🎤 Voice message";
      case "video":
        return "🎥 Video";
      default:
        {
          const content = (message.content || "").toString();
          return content.length > 50 ? `${content.substring(0, 50)}...` : content || "New message";
        }
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } else if (diffInHours < 48) {
      return "Yesterday";
    } else {
      return date.toLocaleDateString();
    }
  };

  const getConversationName = (conversation: IConversation) => {
    if (conversation.type === "group") {
      return conversation.name || "Group Chat";
    }

    // For direct conversations, show the other participant's name
    const me = (currentUserId || "").toString();
    const otherParticipant = conversation.participants.find((p: any) => (p._id || p).toString() !== me);
    return otherParticipant?.name || "Unknown User";
  };

  const getConversationAvatar = (conversation: IConversation) => {
    if (conversation.type === "group") {
      return conversation.avatar || "👥";
    }

    const me = (currentUserId || "").toString();
    const otherParticipant = conversation.participants.find((p: any) => (p._id || p).toString() !== me);
    return otherParticipant?.avatar || "👤";
  };

  const getOnlineParticipants = (conversation: IConversation) => {
    // Exclude current user from online count to avoid marking direct chats online when only you are online
    return conversation.participants.filter((p) => p._id !== currentUserId && p.presence?.isOnline).length;
  };

  const isOtherDirectUserOnline = (conversation: IConversation) => {
    if (conversation.type !== "direct") return false;
    const me = (currentUserId || "").toString();
    const other = conversation.participants.find((p: any) => (p._id || p).toString() !== me);
    return !!other?.presence?.isOnline;
  };

   const isConversationActive = (conversation: IConversation) => currentConversation?._id === conversation._id;

  const normalize = (v: any) => (v || "").toString().toLowerCase();

  const matchesQuery = (conversation: IConversation): boolean => {
    const q = normalize((query || "").trim());
    if (!q) return true;
    const name = normalize(getConversationName(conversation));
    const last = normalize((conversation as any).lastMessage?.content);
    const lastType = normalize((conversation as any).lastMessage?.messageType);
    const participantNames = normalize(
      conversation.participants
        .filter((p: any) => ((p._id || p).toString() !== (currentUserId || "").toString()))
        .map((p) => p.name)
        .join(" ")
    );
    // Also allow quick search by last message type keywords like: image, file, voice, video
    return (
      name.includes(q) ||
      last.includes(q) ||
      participantNames.includes(q) ||
      ["image", "file", "voice", "video", "photo", "picture", "audio"].some((k) => lastType.includes(k) && q.includes(k))
    );
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 bg-gray-50 dark:bg-gray-900">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="flex items-center space-x-4 p-4 rounded-2xl bg-white dark:bg-gray-800 backdrop-blur-sm animate-pulse">
              <div className="relative">
                <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl shadow-lg"></div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gray-300 dark:bg-gray-600 rounded-full border-2 border-white dark:border-gray-800"></div>
              </div>
              <div className="flex-1">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-lg w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-lg w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-6 bg-gray-50 dark:bg-gray-900">
        <div className="text-center max-w-sm mx-auto">
          <div className="w-20 h-20 mx-auto mb-6 text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-800 rounded-2xl flex items-center justify-center backdrop-blur-sm shadow-2xl">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-10 h-10">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <h3 className="text-gray-700 dark:text-gray-300 text-lg font-semibold mb-2">No conversations yet</h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">Start a new conversation to begin your messaging journey</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="space-y-2 p-4">
        {conversations.filter(matchesQuery).map((conversation) => {
          const isActive = isConversationActive(conversation);
          const onlineCount = getOnlineParticipants(conversation);
          const isMuted = conversation.mutedBy?.[currentUserId] || false;

          return (
            <div
              key={conversation._id}
              onClick={() => onConversationSelect(conversation._id)}
              className={`group flex items-center space-x-4 p-4 rounded-2xl cursor-pointer transition-all duration-300 transform hover:scale-[1.02] ${
                isActive 
                  ? "bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 shadow-xl shadow-blue-500/10 backdrop-blur-sm" 
                  : "hover:bg-white dark:hover:bg-gray-800 backdrop-blur-sm hover:shadow-lg"
              }`}
            >
              {/* Avatar */}
              <div className="relative">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-br from-blue-500 to-purple-600 text-white shadow-blue-500/30"
                    : "bg-gradient-to-br from-gray-300 to-gray-400 dark:from-gray-700 dark:to-gray-600 text-gray-700 dark:text-gray-300 group-hover:from-gray-400 group-hover:to-gray-500 dark:group-hover:from-gray-600 dark:group-hover:to-gray-500"
                }`}>
                  {getConversationAvatar(conversation)}
                </div>

                {/* Online indicator */}
                {conversation.type === "direct" && isOtherDirectUserOnline(conversation) && (
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-500 border-3 border-white dark:border-gray-800 rounded-full shadow-lg animate-pulse"></div>
                )}

                {/* Group online count */}
                {conversation.type === "group" && onlineCount > 0 && (
                  <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 border-3 border-white dark:border-gray-800 rounded-full flex items-center justify-center shadow-lg">
                    <span className="text-xs text-white font-bold">{onlineCount}</span>
                  </div>
                )}
              </div>

              {/* Conversation info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-bold truncate transition-colors duration-300 ${
                      isActive ? "text-white" : "text-gray-900 dark:text-gray-200 group-hover:text-gray-700 dark:group-hover:text-white"
                    }`}>
                      {getConversationName(conversation)}
                    </h3>
                    {isMuted && (
                      <span className="text-slate-500 text-sm opacity-70" title="Muted">🔕</span>
                    )}
                  </div>
                  {conversation.lastMessageTime && (
                    <span className={`text-xs font-medium transition-colors duration-300 ${
                      isActive ? "text-blue-200" : "text-gray-500 dark:text-gray-400 group-hover:text-gray-600 dark:group-hover:text-gray-300"
                    }`}>
                      {formatTime(conversation.lastMessageTime)}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <p className={`text-sm truncate flex-1 transition-colors duration-300 ${
                    isActive ? "text-gray-300" : "text-gray-600 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  }`}>
                    {formatLastMessage(conversation.lastMessage)}
                  </p>

                  {/* Unread count for current user */}
                  {conversation.unreadCount && conversation.unreadCount[currentUserId] > 0 && (
                    <div className="ml-3 min-w-[24px] h-6 px-2 bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg shadow-red-500/30 animate-pulse">
                      {conversation.unreadCount[currentUserId] > 99 ? '99+' : conversation.unreadCount[currentUserId]}
                    </div>
                  )}
                  {/* Delete button */}
                  {onConversationDelete && (
                    <button
                      onClick={(e) => { e.stopPropagation(); onConversationDelete(conversation._id); }}
                      className="ml-2 text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
                      title="Delete conversation"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ConversationList;