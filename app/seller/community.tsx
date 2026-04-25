import { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Heart, MessageCircle, PenLine, X } from 'lucide-react-native';
import { supabase } from '@/services/supabase';
import { useAuthStore } from '@/store/useAuthStore';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Post {
  id: string;
  author_id: string;
  content: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author: { name: string } | null;
  my_likes: { id: string }[];
}

export default function SellerCommunityScreen() {
  const { session } = useAuthStore();
  const [posts, setPosts] = useState<Post[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .select('id, author_id, content, likes_count, comments_count, created_at, author:profiles(name), my_likes:post_likes(id)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data ?? []) as unknown as Post[]);
    } catch (e) {
      console.error('posts load error:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPost = async () => {
    if (!newContent.trim()) return;
    if (!session) {
      Alert.alert('알림', '로그인이 필요합니다.');
      return;
    }
    setIsSubmitting(true);
    try {
      const { error } = await supabase.from('posts').insert({
        author_id: session.user.id,
        content: newContent.trim(),
      });
      if (error) throw error;
      setNewContent('');
      setShowModal(false);
      loadPosts();
    } catch (e: any) {
      Alert.alert('오류', e.message ?? '게시글 등록에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (post: Post) => {
    if (!session) return;
    const isLiked = post.my_likes.length > 0;
    try {
      if (isLiked) {
        await supabase
          .from('post_likes')
          .delete()
          .eq('post_id', post.id)
          .eq('user_id', session.user.id);
      } else {
        await supabase.from('post_likes').insert({
          post_id: post.id,
          user_id: session.user.id,
        });
      }
      setPosts((prev) =>
        prev.map((p) =>
          p.id === post.id
            ? {
                ...p,
                likes_count: p.likes_count + (isLiked ? -1 : 1),
                my_likes: isLiked ? [] : [{ id: 'temp' }],
              }
            : p
        )
      );
    } catch (e) {
      console.error('like error:', e);
    }
  };

  const handleDeletePost = (post: Post) => {
    if (post.author_id !== session?.user.id) return;
    Alert.alert('게시글 삭제', '이 게시글을 삭제하시겠습니까?', [
      { text: '취소', style: 'cancel' },
      {
        text: '삭제',
        style: 'destructive',
        onPress: async () => {
          try {
            const { error } = await supabase.from('posts').delete().eq('id', post.id);
            if (error) throw error;
            setPosts((prev) => prev.filter((p) => p.id !== post.id));
          } catch (e: any) {
            Alert.alert('오류', e.message ?? '삭제에 실패했습니다.');
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView className="flex-1 bg-background">
      <View className="flex-row justify-between items-center p-5 bg-white">
        <Text className="font-bold" style={{ fontSize: 22 }}>커뮤니티</Text>
        <TouchableOpacity
          className="flex-row items-center gap-1 rounded-xl"
          style={{ paddingHorizontal: 14, paddingVertical: 8, backgroundColor: '#2ECC71', gap: 6 }}
          onPress={() => setShowModal(true)}
        >
          <PenLine size={16} color="#fff" strokeWidth={2} />
          <Text style={{ color: '#fff', fontWeight: '600', fontSize: 14 }}>글쓰기</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View className="flex-1 justify-center items-center">
          <ActivityIndicator color="#2ECC71" />
        </View>
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          onRefresh={loadPosts}
          refreshing={isLoading}
          ListEmptyComponent={
            <View className="flex-1 justify-center items-center" style={{ paddingTop: 60 }}>
              <Text style={{ color: '#aaa', fontSize: 15 }}>첫 번째 글을 작성해보세요!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const isMyPost = item.author_id === session?.user.id;
            const isLiked = item.my_likes.length > 0;
            return (
              <View className="bg-white rounded-2xl p-4" style={{ gap: 10 }}>
                <View className="flex-row justify-between items-start">
                  <View style={{ gap: 2 }}>
                    <Text style={{ fontWeight: '600', fontSize: 14 }}>
                      {item.author?.name ?? '알 수 없음'}
                    </Text>
                    <Text style={{ color: '#aaa', fontSize: 12 }}>
                      {format(new Date(item.created_at), 'M월 d일 HH:mm', { locale: ko })}
                    </Text>
                  </View>
                  {isMyPost && (
                    <TouchableOpacity onPress={() => handleDeletePost(item)}>
                      <X size={18} color="#ccc" strokeWidth={2} />
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={{ fontSize: 15, lineHeight: 22, color: '#333' }}>{item.content}</Text>
                <View className="flex-row" style={{ gap: 16, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#f5f5f5' }}>
                  <TouchableOpacity
                    className="flex-row items-center"
                    style={{ gap: 5 }}
                    onPress={() => handleLike(item)}
                  >
                    <Heart
                      size={18}
                      color={isLiked ? '#FF3D6C' : '#ccc'}
                      fill={isLiked ? '#FF3D6C' : 'transparent'}
                      strokeWidth={2}
                    />
                    <Text style={{ color: isLiked ? '#FF3D6C' : '#aaa', fontSize: 13 }}>
                      {item.likes_count}
                    </Text>
                  </TouchableOpacity>
                  <View className="flex-row items-center" style={{ gap: 5 }}>
                    <MessageCircle size={18} color="#ccc" strokeWidth={2} />
                    <Text style={{ color: '#aaa', fontSize: 13 }}>{item.comments_count}</Text>
                  </View>
                </View>
              </View>
            );
          }}
        />
      )}

      <Modal visible={showModal} animationType="slide" transparent>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={{ flex: 1 }}
        >
          <View style={{ flex: 1, justifyContent: 'flex-end', backgroundColor: '#00000040' }}>
            <View className="bg-white rounded-t-3xl p-5" style={{ gap: 16 }}>
              <View className="flex-row justify-between items-center">
                <Text style={{ fontSize: 18, fontWeight: '700' }}>새 글 작성</Text>
                <TouchableOpacity onPress={() => setShowModal(false)}>
                  <X size={22} color="#888" strokeWidth={2} />
                </TouchableOpacity>
              </View>
              <TextInput
                value={newContent}
                onChangeText={setNewContent}
                placeholder="내용을 입력해주세요..."
                multiline
                style={{
                  borderWidth: 1,
                  borderColor: '#f0f0f0',
                  borderRadius: 12,
                  padding: 14,
                  fontSize: 15,
                  minHeight: 120,
                  textAlignVertical: 'top',
                  color: '#333',
                }}
              />
              <TouchableOpacity
                onPress={handleSubmitPost}
                disabled={isSubmitting || !newContent.trim()}
                style={{
                  backgroundColor: newContent.trim() ? '#2ECC71' : '#e0e0e0',
                  borderRadius: 12,
                  height: 52,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Text style={{ color: '#fff', fontWeight: '600', fontSize: 16 }}>
                  {isSubmitting ? '등록 중...' : '등록'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}
