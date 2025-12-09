import React, { useState, useRef, useEffect } from 'react';

const initialUsers = {
  '+905000000000': {
    id: 'admin',
    phone: '+905000000000',
    name: 'Yönetici',
    password: 'yonetici123',
    avatar: 'https://placehold.co/100x100/1f2937/white?text=YÖ',
    membership: {
      joinedDate: '2020-01-01',
      duesYear: 2025,
      duesPaid: true,
      debtAmount: 0,
    },
    isAdmin: true
  }
};

const initialPosts = [];
const initialPolls = [];

// 🏦 DERNEK İBAN BİLGİLERİ
const DERNEK_IBAN = "TR49000000073773829398483";
const DERNEK_ADI = "Yeşilbük Köyü Dernek Vakfı";
const DERNEK_BANKA = "Ziraat Bankası / Ümraniye";

export default function App() {
  const [view, setView] = useState('login');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  
  const [users, setUsers] = useState(initialUsers);
  const [posts, setPosts] = useState(initialPosts);
  const [polls, setPolls] = useState(initialPolls);

  const fileInputRef = useRef(null);
  const videoInputRef = useRef(null);
  const avatarInputRef = useRef(null);

  // Beğeni işlemi
  const handleLikePost = (postId) => {
    if (!user || user.isAdmin) return;
    
    setPosts(prev =>
      prev.map(post => {
        if (post.id === postId) {
          if (post.likedBy.includes(user.id)) {
            return post;
          }
          return {
            ...post,
            likes: post.likes + 1,
            likedBy: [...post.likedBy, user.id]
          };
        }
        return post;
      })
    );
  };

  // Yorum ekleme
  const handleAddComment = (postId, commentText) => {
    if (!user || !commentText.trim()) return;
    const newComment = {
      id: Date.now().toString(),
      userId: user.id,
      text: commentText.trim(),
      createdAt: new Date().toISOString()
    };
    setPosts(prev =>
      prev.map(post =>
        post.id === postId
          ? { ...post, comments: [...post.comments, newComment] }
          : post
      )
    );
  };

  // Üye girişi
  const handleLogin = (e) => {
    e.preventDefault();
    const formattedPhone = phone.trim().replace(/\s+/g, '');
    
    if (!formattedPhone.startsWith('+')) {
      setError('Telefon numarası uluslararası formatta olmalı (örn: +905551234567)');
      return;
    }
    
    const userEntry = users[formattedPhone];
    if (userEntry) {
      if (userEntry.password === password) {
        setUser(userEntry);
        setView(userEntry.isAdmin ? 'admin-panel' : 'feed');
        setError('');
      } else {
        setError('Hatalı şifre');
      }
    } else {
      setError('Bu telefon numarası ile kayıtlı üye bulunamadı.');
    }
  };

  // Üye kaydı
  const handleRegister = (e) => {
    e.preventDefault();
    const formattedPhone = phone.trim().replace(/\s+/g, '');
    
    if (!formattedPhone.startsWith('+')) {
      setError('Telefon numarası uluslararası formatta olmalı');
      return;
    }
    
    if (!name.trim()) {
      setError('Ad soyad boş bırakılamaz');
      return;
    }
    
    if (password.length < 4) {
      setError('Şifre en az 4 karakter olmalıdır');
      return;
    }
    
    if (users[formattedPhone]) {
      setError('Bu telefon numarası zaten kayıtlı');
      return;
    }
    
    const newUser = {
      id: Date.now().toString(),
      phone: formattedPhone,
      name: name.trim(),
      password: password,
      avatar: 'https://placehold.co/100x100/6b7280/white?text=' + (name.trim().charAt(0) || 'U'),
      membership: {
        joinedDate: new Date().toISOString().split('T')[0],
        duesYear: new Date().getFullYear(),
        duesPaid: false,
        debtAmount: 0,
      }
    };
    
    setUsers(prev => ({ ...prev, [formattedPhone]: newUser }));
    setUser(newUser);
    setView('feed');
    setError('');
  };

  // Duyuru paylaşma
  const handleCreatePost = (e) => {
    e.preventDefault();
    const content = e.target.content.value;
    if (!content.trim()) {
      setError('Duyuru metni boş olamaz');
      return;
    }
    
    const imageFile = fileInputRef.current?.files[0];
    const videoFile = videoInputRef.current?.files[0];
    
    if (!imageFile && !videoFile) {
      setError('Lütfen bir görsel veya video yükleyin');
      return;
    }

    let media = null;
    if (imageFile) {
      media = { type: 'image', url: URL.createObjectURL(imageFile) };
    } else if (videoFile) {
      media = { type: 'video', url: URL.createObjectURL(videoFile) };
    }

    const newPost = {
      id: Date.now().toString(),
      content: content.trim(),
      media,
      createdAt: new Date().toISOString(),
      likes: 0,
      likedBy: [],
      comments: []
    };
    
    setPosts([newPost, ...posts]);
    e.target.content.value = '';
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (videoInputRef.current) videoInputRef.current.value = '';
    setError('');
  };

  // Anket paylaşma
  const handleCreatePoll = (e) => {
    e.preventDefault();
    const question = e.target.question.value;
    const option1 = e.target.option1.value;
    const option2 = e.target.option2.value;
    const option3 = e.target.option3.value;
    
    if (!question || !option1 || !option2) {
      setError('Anket sorusu ve en az 2 seçenek girilmeli');
      return;
    }
    
    const options = [
      { id: 'opt1', text: option1, votes: 0 },
      { id: 'opt2', text: option2, votes: 0 }
    ];
    
    if (option3.trim()) {
      options.push({ id: 'opt3', text: option3, votes: 0 });
    }
    
    const newPoll = {
      id: Date.now().toString(),
      question,
      options,
      votedBy: [],
      createdAt: new Date().toISOString()
    };
    
    setPolls([newPoll, ...polls]);
    e.target.reset();
    setError('');
  };

  // Üye oylama
  const handleVote = (pollId, optionId) => {
    if (!user || user.isAdmin) return;
    
    setPolls(prev =>
      prev.map(poll => {
        if (poll.id === pollId && !poll.votedBy.includes(user.id)) {
          const updatedOptions = poll.options.map(opt =>
            opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt
          );
          return {
            ...poll,
            options: updatedOptions,
            votedBy: [...poll.votedBy, user.id]
          };
        }
        return poll;
      })
    );
  };

  // Yönetici: Yeni üye ekle
  const handleAddNewUser = (e) => {
    e.preventDefault();
    const phone = e.target.phone.value.trim();
    const name = e.target.name.value.trim();
    
    if (!phone || !name) {
      setError('Telefon numarası ve ad soyad zorunludur.');
      return;
    }
    
    if (!phone.startsWith('+')) {
      setError('Telefon numarası uluslararası formatta olmalı (örn: +905551234567)');
      return;
    }
    
    if (users[phone]) {
      setError('Bu telefon numarası zaten sistemde kayıtlı.');
      return;
    }
    
    const newUser = {
      id: Date.now().toString(),
      phone,
      name,
      password: '123456',
      avatar: 'https://placehold.co/100x100/6b7280/white?text=' + (name.charAt(0) || 'U'),
      membership: {
        joinedDate: new Date().toISOString().split('T')[0],
        duesYear: new Date().getFullYear(),
        duesPaid: false,
        debtAmount: 0,
      }
    };
    
    setUsers(prev => ({ ...prev, [phone]: newUser }));
    setError('');
    e.target.reset();
  };

  // Üye: Profil fotoğrafı değiştir
  const handleUpdateOwnAvatar = (e) => {
    const file = e.target.files[0];
    if (file && user && !user.isAdmin) {
      const avatarUrl = URL.createObjectURL(file);
      setUsers(prev => ({
        ...prev,
        [user.phone]: {
          ...prev[user.phone],
          avatar: avatarUrl
        }
      }));
      setUser(prev => ({ ...prev, avatar: avatarUrl }));
    }
  };

  const handleLogout = () => {
    setUser(null);
    setPhone('');
    setPassword('');
    setName('');
    setView('login');
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInHours = Math.floor((now - postDate) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'Az önce';
    if (diffInHours < 24) return `${diffInHours} saat önce`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} gün önce`;
    return postDate.toLocaleDateString('tr-TR');
  };

  const getUserName = (userId) => {
    if (userId === 'admin') return 'Yönetici';
    const userEntry = Object.values(users).find(u => u.id === userId);
    return userEntry ? userEntry.name : 'Üye';
  };

  // ======================
  // GİRİŞ EKRANI (İBAN BİLGİLERİ İLE)
  // ======================

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animasyonlu arka plan */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
          <div className="absolute top-40 -left-40 w-80 h-80 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
        </div>
        
        {/* Kayan hoş geldiniz mesajı */}
        <div className="absolute top-4 left-0 right-0 text-center z-10">
          <div className="inline-block bg-black/20 backdrop-blur-sm text-white px-4 py-1 rounded-full animate-pulse">
            <span className="font-medium">Yeşilbük Köyü Uygulamasına Hoşgeldiniz • Eren Koç tarafından yapılmıştır • 2025™</span>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20 relative z-10">
          <div className="text-center mb-8">
            <div className="mx-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-bold mb-4">
              YK
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-700 bg-clip-text text-transparent">
              Yeşilbük Köyü
            </h1>
            <p className="text-gray-600 mt-2">Topluluk Platformu</p>
          </div>

          {/* 🏦 DERNEK İBAN BİLGİLERİ */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6">
            <h3 className="font-bold text-emerald-800 text-center mb-2">📌 Dernek Destek Bilgileri</h3>
            <div className="text-sm text-emerald-700 space-y-1">
              <p><strong>IBAN:</strong> {DERNEK_IBAN}</p>
              <p><strong>Dernek:</strong> {DERNEK_ADI}</p>
              <p><strong>Banka:</strong> {DERNEK_BANKA}</p>
            </div>
          </div>

          <div className="space-y-4">
            <button
              onClick={() => setView('user-login')}
              className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200"
            >
              Üye Girişi
            </button>
            <button
              onClick={() => setView('user-register')}
              className="w-full py-3 bg-white text-emerald-600 border border-emerald-200 rounded-xl font-medium shadow hover:bg-emerald-50 transition-all"
            >
              Yeni Üye Ol
            </button>
          </div>
        </div>
        
        <style jsx>{`
          @keyframes blob {
            0% { transform: translate(0px, 0px) scale(1); }
            33% { transform: translate(30px, -50px) scale(1.1); }
            66% { transform: translate(-20px, 20px) scale(0.9); }
            100% { transform: translate(0px, 0px) scale(1); }
          }
          .animate-blob {
            animation: blob 7s infinite;
          }
          .animation-delay-2000 {
            animation-delay: 2s;
          }
          .animation-delay-4000 {
            animation-delay: 4s;
          }
        `}</style>
      </div>
    );
  }

  if (view === 'user-login') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-6">
            <div className="mx-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold mb-3">
              YK
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Üye Girişi</h2>
            <p className="text-gray-600 mt-1">Telefon numaranız ve şifrenizle giriş yapın</p>
          </div>

          {/* 🏦 DERNEK İBAN BİLGİLERİ */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-emerald-700 text-center">
              <strong>IBAN:</strong> {DERNEK_IBAN}
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+905551234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white/70"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifreniz"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white/70"
              required
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Giriş Yap
            </button>
            <button
              type="button"
              onClick={() => setView('login')}
              className="w-full text-gray-600 py-2"
            >
              ← Ana Menü
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'user-register') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-purple-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white/80 backdrop-blur-lg rounded-3xl shadow-2xl p-8 w-full max-w-md border border-white/20">
          <div className="text-center mb-6">
            <div className="mx-auto bg-gradient-to-r from-emerald-500 to-teal-600 text-white w-14 h-14 rounded-xl flex items-center justify-center text-xl font-bold mb-3">
              YK
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Yeni Üye Ol</h2>
            <p className="text-gray-600 mt-1">Bilgilerinizi girerek katılın</p>
          </div>

          {/* 🏦 DERNEK İBAN BİLGİLERİ */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 mb-4">
            <p className="text-xs text-emerald-700 text-center">
              <strong>IBAN:</strong> {DERNEK_IBAN}
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-5">
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+905551234567"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white/70"
              required
            />
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ad Soyad"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white/70"
              required
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Şifre (en az 4 karakter)"
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none bg-white/70"
              required
            />
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-medium shadow-lg hover:shadow-xl transition-all"
            >
              Üye Ol
            </button>
            <button
              type="button"
              onClick={() => setView('login')}
              className="w-full text-gray-600 py-2"
            >
              ← Ana Menü
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (view === 'feed') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center">
                <span className="text-white font-bold text-sm">YK</span>
              </div>
              <span className="font-bold text-gray-800">Yeşilbük Köyü</span>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setView('membership')}
                className="text-sm bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full hover:bg-emerald-200"
              >
                Üyelik
              </button>
              <button
                onClick={handleLogout}
                className="text-sm text-gray-500 hover:text-gray-700"
              >
                Çıkış
              </button>
            </div>
          </div>
        </header>

        {/* 🏦 ÜSTTE DERNEK İBAN */}
        <div className="bg-emerald-50 border-b border-emerald-200 py-2">
          <p className="text-xs text-emerald-700 text-center">
            <strong>Destek için:</strong> {DERNEK_IBAN} • {DERNEK_ADI}
          </p>
        </div>

        <main className="max-w-2xl mx-auto py-6 px-4 pb-20">
          {polls.map((poll) => (
            <div key={poll.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <span className="text-blue-800">📊</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-800">Köy Anketi</h3>
                    <p className="text-xs text-gray-500">{formatDate(poll.createdAt)}</p>
                  </div>
                </div>
                <h4 className="font-medium text-gray-800 mb-4">{poll.question}</h4>
                <div className="space-y-3">
                  {poll.options.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleVote(poll.id, option.id)}
                      disabled={poll.votedBy.includes(user?.id) || user?.isAdmin}
                      className={`w-full text-left p-3 rounded-xl border ${
                        poll.votedBy.includes(user?.id) 
                          ? (option.votes === Math.max(...poll.options.map(o => o.votes)) 
                              ? 'border-green-500 bg-green-50' 
                              : 'border-gray-200 bg-gray-50')
                          : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50'
                      } ${poll.votedBy.includes(user?.id) || user?.isAdmin ? 'cursor-default' : ''}`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="text-gray-700">{option.text}</span>
                        <span className="text-sm font-medium text-gray-500">{option.votes} oy</span>
                      </div>
                    </button>
                  ))}
                </div>
                {poll.votedBy.includes(user?.id) && (
                  <p className="text-sm text-gray-500 mt-3 text-center">
                    Oyunuz kaydedildi
                  </p>
                )}
              </div>
            </div>
          ))}

          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
              <div className="p-5">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-emerald-800 font-bold">YK</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="font-semibold text-gray-800">Yeşilbük Köyü</h3>
                    <p className="text-xs text-gray-500">{formatDate(post.createdAt)}</p>
                  </div>
                </div>
                <p className="text-gray-700 mb-4 whitespace-pre-wrap">{post.content}</p>

                {post.media && (
                  <div className="rounded-xl overflow-hidden border border-gray-200 mb-4">
                    {post.media.type === 'video' ? (
                      <video src={post.media.url} controls className="w-full" style={{maxHeight: '400px'}} />
                    ) : (
                      <img src={post.media.url} alt="Duyuru" className="w-full object-cover" style={{maxHeight: '400px'}} />
                    )}
                  </div>
                )}

                <div className="flex items-center mt-4 space-x-6">
                  <button
                    onClick={() => handleLikePost(post.id)}
                    disabled={!user || user.isAdmin || post.likedBy.includes(user.id)}
                    className={`flex items-center space-x-1 ${
                      post.likedBy.includes(user?.id) ? 'text-emerald-600' : 'text-gray-500 hover:text-emerald-600'
                    } ${(!user || user.isAdmin) ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span>👍</span>
                    <span className="text-sm font-medium">{post.likes}</span>
                  </button>
                  <span className="text-sm text-gray-500">{post.comments.length} yorum</span>
                </div>

                {user && !user.isAdmin && (
                  <div className="mt-4 flex space-x-2">
                    <input
                      type="text"
                      placeholder="Yorum yaz..."
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          handleAddComment(post.id, e.target.value);
                          e.target.value = '';
                        }
                      }}
                      className="flex-1 px-4 py-2.5 border border-gray-300 rounded-full text-sm bg-white"
                    />
                    <button
                      onClick={(e) => {
                        const input = e.target.previousElementSibling;
                        if (input.value.trim()) {
                          handleAddComment(post.id, input.value);
                          input.value = '';
                        }
                      }}
                      className="bg-emerald-600 text-white px-4 py-2.5 rounded-full text-sm hover:bg-emerald-700"
                    >
                      Gönder
                    </button>
                  </div>
                )}

                {post.comments.length > 0 && (
                  <div className="mt-4 space-y-3 max-h-60 overflow-y-auto">
                    {post.comments.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-medium">
                          {getUserName(comment.userId).charAt(0)}
                        </div>
                        <div className="bg-gray-100 rounded-xl p-3 flex-1">
                          <div className="flex justify-between">
                            <span className="font-medium text-sm text-gray-800">{getUserName(comment.userId)}</span>
                          </div>
                          <p className="text-sm text-gray-700 mt-1">{comment.text}</p>
                          <p className="text-xs text-gray-500 mt-1">{formatDate(comment.createdAt)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </main>
      </div>
    );
  }

  if (view === 'membership') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-white shadow-sm sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-3 flex justify-between items-center">
            <button
              onClick={() => setView('feed')}
              className="text-emerald-600 font-medium"
            >
              ← Geri Dön
            </button>
            <h1 className="text-lg font-bold text-gray-800">Üyelik Bilgilerim</h1>
            <div className="w-10"></div>
          </div>
        </header>

        {/* 🏦 ÜSTTE İBAN */}
        <div className="bg-emerald-50 border-b border-emerald-200 py-2">
          <p className="text-xs text-emerald-700 text-center">
            <strong>Destek için IBAN:</strong> {DERNEK_IBAN}
          </p>
        </div>

        <main className="max-w-2xl mx-auto py-6 px-4 pb-20">
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="text-center mb-6">
              <div className="relative inline-block mb-4">
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-20 h-20 rounded-full mx-auto mb-3 border-2 border-emerald-200"
                />
                {!user.isAdmin && (
                  <label className="absolute bottom-0 right-0 bg-emerald-600 text-white p-2 rounded-full cursor-pointer">
                    ✎
                    <input
                      type="file"
                      accept="image/png, image/jpeg"
                      onChange={handleUpdateOwnAvatar}
                      ref={avatarInputRef}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <h2 className="text-xl font-bold text-gray-800">{user.name}</h2>
              <p className="text-gray-600">{user.phone || 'Yönetici Hesabı'}</p>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">Üye Olma Tarihi</span>
                <span className="font-medium">{new Date(user.membership.joinedDate).toLocaleDateString('tr-TR')}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">Aidat Yılı</span>
                <span className="font-medium">{user.membership.duesYear}</span>
              </div>
              <div className="flex justify-between border-b pb-3">
                <span className="text-gray-600">Aidat Ödendi mi?</span>
                <span className={`font-medium ${user.membership.duesPaid ? 'text-green-600' : 'text-red-600'}`}>
                  {user.membership.duesPaid ? 'Evet' : 'Hayır'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Borç Tutarı</span>
                <span className={`font-medium ${user.membership.debtAmount > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {user.membership.debtAmount > 0 ? `${user.membership.debtAmount} TL` : 'Borç Yok'}
                </span>
              </div>
            </div>

            <div className="mt-6 text-center text-sm text-gray-500">
              <p>Bilgileriniz yönetici tarafından güncellenmektedir.</p>
              {!user.isAdmin && <p className="mt-1">Profil fotoğrafınızı değiştirmek için ✎ simgesine tıklayın</p>}
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (view === 'admin-panel') {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="bg-gray-800 text-white sticky top-0 z-10">
          <div className="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
            <div className="flex items-center">
              <div className="w-8 h-8 rounded-full bg-white text-gray-800 flex items-center justify-center font-bold mr-2">
                YK
              </div>
              <h1 className="text-xl font-bold">Yönetici Paneli</h1>
            </div>
            <button
              onClick={handleLogout}
              className="text-sm bg-red-600 hover:bg-red-700 px-3 py-1 rounded"
            >
              Çıkış
            </button>
          </div>
        </header>

        <main className="max-w-4xl mx-auto py-6 px-4 space-y-8">
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold mb-4">Yeni Üye Ekle</h2>
            <form onSubmit={handleAddNewUser} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Telefon Numarası *</label>
                <input
                  name="phone"
                  type="tel"
                  placeholder="+905551234567"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad *</label>
                <input
                  name="name"
                  type="text"
                  placeholder="Ahmet Yılmaz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                  required
                />
              </div>
              <div className="md:col-span-2">
                {error && <p className="text-red-500 text-sm mb-2">{error}</p>}
                <button
                  type="submit"
                  className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
                >
                  Üye Ekle
                </button>
              </div>
            </form>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold mb-4">Yeni Duyuru</h2>
            <form onSubmit={handleCreatePost} className="space-y-4">
              <textarea
                name="content"
                placeholder="Duyuru metnini yazın..."
                className="w-full p-3 border border-gray-300 rounded-lg min-h-[100px]"
                required
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Görsel Yükle (.png, .jpg)</label>
                <input
                  type="file"
                  accept="image/png, image/jpeg"
                  ref={fileInputRef}
                  className="block w-full text-sm text-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Video Yükle (.mp4, .mov)</label>
                <input
                  type="file"
                  accept="video/mp4, video/quicktime"
                  ref={videoInputRef}
                  className="block w-full text-sm text-gray-500"
                />
              </div>
              {error && <p className="text-red-500 text-sm">{error}</p>}
              <button
                type="submit"
                className="bg-emerald-600 text-white px-4 py-2 rounded-lg"
              >
                Duyuruyu Yayınla
              </button>
            </form>
          </div>

          {/* 📊 YENİ: ANKET OLUŞTURMA */}
          <div className="bg-white rounded-2xl shadow-sm p-5">
            <h2 className="text-lg font-bold mb-4">Köy Halkı Talep Anketi</h2>
            <p className="text-sm text-gray-600 mb-4">Köy halkının ihtiyaçlarını öğrenmek için anket oluşturun</p>
            <form onSubmit={handleCreatePoll} className="space-y-4">
              <input
                name="question"
                type="text"
                placeholder="Anket sorusu (örn: Köyde hangi etkinliği istersiniz?)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                name="option1"
                type="text"
                placeholder="Seçenek 1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                name="option2"
                type="text"
                placeholder="Seçenek 2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                required
              />
              <input
                name="option3"
                type="text"
                placeholder="Seçenek 3 (isteğe bağlı)"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg"
              >
                Anketi Yayınla
              </button>
            </form>
          </div>
        </main>
      </div>
    );
  }

  return null;
}
