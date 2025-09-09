import React, { useEffect, useRef, useState } from "react";
import { Users, User, Phone, Video, Info, MessageCircle, Menu } from "lucide-react";
import CallModal from "./CallModal";
import ConversationInfoDrawer from "./ConversationInfoDrawer";
import type { IConversation, IMessage } from "../../service/chatService";
import Spinner from "../Spinner";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";
import ForwardMessageModal from "./ForwardMessageModal";

interface ChatInterfaceProps {
  conversation: IConversation;
  messages: IMessage[];
  typingUsers: string[];
  onSendMessage: (content: string, messageType?: string, mediaUrl?: string, durationSeconds?: number, replyToId?: string) => void;
  onTyping: (isTyping: boolean) => void;
  onMessageReaction: (messageId: string, reactionType: string, emoji: string) => void;
  onMessageEdit: (messageId: string, content: string) => void;
  onMessageDelete: (messageId: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onConversationUpdate?: (conversation: IConversation) => void;
  currentUser: any;
  onToggleSidebar?: () => void;
  onLoadOlder?: () => Promise<void>;
  hasMoreOlder?: boolean;
  isLoadingOlder?: boolean;
  allConversations: IConversation[];
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({
  conversation,
  messages,
  typingUsers,
  onSendMessage,
  onTyping,
  onMessageReaction,
  onMessageEdit,
  onMessageDelete,
  onMarkAsRead,
  onConversationUpdate,
  currentUser,
  onToggleSidebar,
  onLoadOlder,
  hasMoreOlder = false,
  isLoadingOlder = false,
  allConversations,
}) => {
  const currentUserId: string | undefined = currentUser?.id || currentUser?._id;
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const messageIdToElementRef = useRef<Map<string, HTMLElement>>(new Map());
  const typingTimeoutRef = useRef<NodeJS.Timeout>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [callState, setCallState] = useState<{
    open: boolean;
    type: "audio" | "video";
    isCaller: boolean;
  }>({ open: false, type: "audio", isCaller: true });
  const [replyToMessage, setReplyToMessage] = useState<IMessage | null>(null);
  const [forwardSource, setForwardSource] = useState<IMessage | null>(null);
  const [forwardOpen, setForwardOpen] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (!isLoadingOlder) {
      scrollToBottom();
    }
  }, [messages, isLoadingOlder]);

  const handleScroll = async () => {
    const container = messagesContainerRef.current;
    if (!container || !onLoadOlder || isLoadingOlder || !hasMoreOlder) return;
    if (container.scrollTop <= 100) {
      const previousScrollHeight = container.scrollHeight;
      const previousScrollTop = container.scrollTop;
      try {
        await onLoadOlder();
      } finally {
        // Preserve position after prepending older messages
        requestAnimationFrame(() => {
          const newScrollHeight = container.scrollHeight;
          container.scrollTop = newScrollHeight - previousScrollHeight + previousScrollTop;
        });
      }
    }
  };

  useEffect(() => {
    // Mark messages as read when they come into view
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const messageId = entry.target.getAttribute("data-message-id");
            if (messageId) {
              onMarkAsRead(messageId);
            }
          }
        });
      },
      { threshold: 0.5 }
    );

    messages.forEach((message) => {
      const messageElement = document.querySelector(`[data-message-id="${message._id}"]`);
      if (messageElement) {
        messageIdToElementRef.current.set(message._id, messageElement as HTMLElement);
        observer.observe(messageElement);
      }
    });

    return () => observer.disconnect();
  }, [messages, onMarkAsRead]);

  const handleTyping = (value: string) => {
    if (!isTyping && value.length > 0) {
      setIsTyping(true);
      onTyping(true);
    } else if (isTyping && value.length === 0) {
      setIsTyping(false);
      onTyping(false);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (value.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        onTyping(false);
      }, 2000);
    }
  };

  const handleSendMessage = (content: string, messageType: string = "text", mediaUrl?: string, durationSeconds?: number) => {
    onSendMessage(content, messageType, mediaUrl, durationSeconds, replyToMessage?._id);
    setIsTyping(false);
    onTyping(false);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (replyToMessage) {
      setReplyToMessage(null);
    }
  };

  // Stop typing when component unmounts or conversation changes
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        onTyping(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [conversation._id]);

  // Avoid showing own user in typing list in any case
  const filteredTypingUsers = React.useMemo(() => {
    const uid = currentUserId;
    return (typingUsers || []).filter((id) => id !== uid);
  }, [typingUsers, currentUserId]);

  const getConversationName = () => {
    if (conversation.type === "group") {
      return conversation.name || "Group Chat";
    }

    const otherParticipant = conversation.participants.find((p) => p._id !== currentUserId);
    return otherParticipant?.name || "Unknown User";
  };

  const getOnlineParticipants = () => {
    // Exclude current user for meaningful online indicator
    return conversation.participants.filter((p) => p._id !== currentUserId && p.presence?.isOnline).length;
  };

  const getDirectUserStatusText = () => {
    const otherUser = conversation.participants.find((p) => p._id !== currentUserId);
    
    if (otherUser?.presence?.isOnline) {
      return "Online";
    } else if (otherUser?.presence?.lastSeen) {
      const lastSeen = new Date(otherUser.presence.lastSeen);
      const now = new Date();
      const diffInMinutes = Math.floor((now.getTime() - lastSeen.getTime()) / (1000 * 60));
      
      if (diffInMinutes < 1) return "Just now";
      if (diffInMinutes < 60) return `Last seen ${diffInMinutes}m ago`;
      if (diffInMinutes < 1440) return `Last seen ${Math.floor(diffInMinutes / 60)}h ago`;
      return `Last seen ${Math.floor(diffInMinutes / 1440)}d ago`;
    }
    
    return "Offline";
  };

  const getTypingText = () => {
    if (filteredTypingUsers.length === 0) return null;

    const typingUserNames = filteredTypingUsers
      .map((userId) => {
        const user = conversation.participants.find((p) => p._id === userId);
        return user?.name || "Someone";
      })
      .filter(Boolean);

    if (typingUserNames.length === 1) {
      return `${typingUserNames[0]} is typing...`;
    } else if (typingUserNames.length === 2) {
      return `${typingUserNames[0]} and ${typingUserNames[1]} are typing...`;
    } else {
      return "Several people are typing...";
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gray-900">
      {/* Header */}
      <div className="flex items-center justify-between p-6 backdrop-blur-sm bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 shadow-lg">
        <div className="flex items-center space-x-4">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="mr-2 p-3 text-gray-400 dark:text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group backdrop-blur-sm border border-gray-200 dark:border-gray-700 lg:hidden"
              title="Show conversations"
            >
              <Menu className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          )}
          <div className="relative">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xl font-bold text-white shadow-lg ring-2 ring-gray-200 dark:ring-gray-700">
              {conversation.type === "group" ? <Users size={20} /> : <User size={20} />}
            </div>

            {/* Online indicator */}
            {conversation.type === "direct" && getOnlineParticipants() > 0 && (
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-gradient-to-r from-emerald-400 to-emerald-500 border-3 border-white dark:border-gray-800 rounded-full shadow-md animate-pulse"></div>
            )}

            {/* Group online count */}
            {conversation.type === "group" && getOnlineParticipants() > 0 && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-gradient-to-r from-emerald-400 to-emerald-500 border-2 border-white dark:border-gray-800 rounded-full flex items-center justify-center shadow-md">
                <span className="text-xs text-white font-bold">{getOnlineParticipants()}</span>
              </div>
            )}
          </div>

          <div>
            <h2 className="font-bold text-xl text-gray-900 dark:text-white">{getConversationName()}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center">
              {conversation.type === "group" ? (
                <>
                  <span className="w-2 h-2 bg-gray-400 dark:bg-gray-500 rounded-full mr-2"></span>
                  {conversation.participants.length} members • {getOnlineParticipants()} online
                </>
              ) : (
                <>
                  <span className={`w-2 h-2 rounded-full mr-2 ${
                    conversation.participants.find((p) => p._id !== currentUserId)?.presence?.isOnline 
                      ? 'bg-emerald-500 animate-pulse' 
                      : 'bg-gray-400 dark:bg-gray-500'
                  }`}></span>
                  {getDirectUserStatusText()}
                </>
              )}
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            className="p-3 text-gray-400 dark:text-gray-400 hover:text-emerald-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-emerald-500/30"
            title="Start audio call"
            onClick={() => setCallState({ open: true, type: "audio", isCaller: true })}
          >
            <Phone className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button
            className="p-3 text-gray-400 dark:text-gray-400 hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-blue-500/30"
            title="Start video call"
            onClick={() => setCallState({ open: true, type: "video", isCaller: true })}
          >
            <Video className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
          <button 
            onClick={() => setInfoOpen(true)} 
            className="p-3 text-gray-400 dark:text-gray-400 hover:text-purple-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-all duration-200 group backdrop-blur-sm border border-gray-200 dark:border-gray-700 hover:border-purple-500/30" 
            title="Conversation info"
          >
            <Info className="w-5 h-5 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50 dark:bg-gray-900"
      >
        {isLoadingOlder && (
          <div className="pt-2 pb-4">
            <Spinner text="Loading messages..." size={2} colorClass="border-gray-400 dark:border-gray-500" />
          </div>
        )}
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 text-gray-400 dark:text-gray-600 relative">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-600/20 rounded-full animate-pulse"></div>
                <MessageCircle className="relative z-10 w-full h-full" strokeWidth={1.5} />
              </div>
              <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200 mb-3">No messages yet</h3>
              <p className="text-gray-500 dark:text-gray-400">Start the conversation by sending a message</p>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message._id} data-message-id={message._id}>
              <MessageBubble
                message={message}
                isOwnMessage={message.sender._id === currentUserId}
                onReaction={onMessageReaction}
                onEdit={onMessageEdit}
                onDelete={onMessageDelete}
                currentUser={currentUser}
                onReply={(m) => setReplyToMessage(m)}
                onForward={(m) => { 
          setForwardSource(m); 
          setForwardOpen(true); 
        }}
              />
            </div>
          ))
        )}

        {/* Typing indicator */}
        {getTypingText() && (
          <div className="flex items-center space-x-3 text-sm text-gray-500 dark:text-gray-400 italic p-4 bg-white dark:bg-gray-800 rounded-2xl backdrop-blur-sm border border-gray-200 dark:border-gray-700">
            <div className="flex space-x-1">
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
              <div className="w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
            </div>
            <span>{getTypingText()}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-white dark:bg-gray-800 backdrop-blur-sm">
        {replyToMessage && (
          <div className="mb-3 flex items-center justify-between rounded-xl bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 p-3">
            <div className="text-sm text-gray-700 dark:text-gray-300 truncate">
              Replying to <span className="font-semibold">{replyToMessage.sender?.name || "user"}</span>: {replyToMessage.content?.slice(0, 60) || replyToMessage.fileName || "media"}
            </div>
            <button
              onClick={() => setReplyToMessage(null)}
              className="ml-3 text-xs px-2 py-1 rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-500"
              title="Cancel reply"
            >
              Cancel
            </button>
            <button
              onClick={() => {
                const originalId = (replyToMessage as any)?._id;
                const el = originalId ? messageIdToElementRef.current.get(originalId) : null;
                const container = messagesContainerRef.current;
                if (el && container) {
                  container.scrollTo({ top: el.offsetTop - 80, behavior: "smooth" });
                  el.classList.add("ring-2", "ring-emerald-500", "ring-offset-2", "ring-offset-white", "dark:ring-offset-gray-800");
                  setTimeout(() => {
                    el.classList.remove("ring-2", "ring-emerald-500", "ring-offset-2", "ring-offset-white", "dark:ring-offset-gray-800");
                  }, 1500);
                }
              }}
              className="ml-2 text-xs px-2 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500"
              title="Go to original"
            >
              View
            </button>
          </div>
        )}
        <MessageInput
          onSendMessage={handleSendMessage}
          onTyping={handleTyping}
          placeholder={`Message ${getConversationName()}...`}
          onCancelReply={() => setReplyToMessage(null)}
        />
      </div>
      <ConversationInfoDrawer 
        open={infoOpen} 
        onClose={() => setInfoOpen(false)} 
        conversation={conversation} 
        currentUserId={currentUserId!} 
        onConversationUpdate={onConversationUpdate}
      />
      <CallModal
        isOpen={callState.open}
        onClose={() => setCallState((s) => ({ ...s, open: false }))}
        conversationId={conversation._id}
        callType={callState.type}
        isCaller={callState.isCaller}
      />
      <ForwardMessageModal
        isOpen={forwardOpen}
        onClose={() => setForwardOpen(false)}
        message={forwardSource}
        conversations={allConversations}
        currentConversationId={conversation._id}
        currentUserId={currentUserId}
        onForward={async (targetConversationId, msg) => {
          try {
            // Import the socket service dynamically to avoid circular dependencies
            const chatSocketService = (await import("../../socket/chatSocket")).default;
            
            // Check socket connection
            const isConnected = chatSocketService.getConnectionStatus();
            
            if (!isConnected) {
              chatSocketService.connect();
            }
            
            // Use WebSocket to forward the message
            await chatSocketService.forwardMessage(
              msg._id,
              targetConversationId
            );
            
            // Close the modal
            setForwardOpen(false);
            setForwardSource(null);
            
            // You can add a toast notification here if you have a toast system
            // toast.success("Message forwarded successfully");
            
          } catch (error) {
            // You can add error handling here
            // toast.error("Failed to forward message");
          }
        }}
      />
    </div>
  );
};

export default ChatInterface;