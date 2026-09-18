import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  increment,
  Timestamp
} from 'firebase/firestore';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { Article, AppUser } from '../types';

// Configurações Nativas do Firebase do projeto Jornal WazzimaGiygg
export const firebaseConfig = {
  apiKey: "AIzaSyB9GkSqTIZ0kbVsba_WOdQeVAETrF9qna0",
  authDomain: "wzzm-ce3fc.firebaseapp.com",
  projectId: "wzzm-ce3fc",
  storageBucket: "wzzm-ce3fc.appspot.com",
  messagingSenderId: "249427877153",
  appId: "1:249427877153:web:0e4297294794a5aadeb260"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const SPECIFIC_ADMIN_UID = "sZxfMuOBPbXdR8nttVPXIN8QOOl1";

export async function loginWithGoogle(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  const user = result.user;

  // Sync with users collection
  try {
    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    const isAdmin = user.uid === SPECIFIC_ADMIN_UID || (userDoc.exists() && userDoc.data()?.role === 'admin');
    
    await setDoc(userRef, {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || user.email?.split('@')[0] || 'Autor',
      photoURL: user.photoURL || null,
      lastLogin: serverTimestamp(),
      role: isAdmin ? 'admin' : (userDoc.exists() && userDoc.data()?.role ? userDoc.data()?.role : 'leitor'),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn("Could not sync user profile in firestore:", err);
  }

  return user;
}

export async function logoutUser(): Promise<void> {
  await signOut(auth);
}

export async function getUserProfile(uid: string): Promise<AppUser | null> {
  try {
    const userRef = doc(db, 'users', uid);
    const snap = await getDoc(userRef);
    if (snap.exists()) {
      const data = snap.data();
      const isAdmin = uid === SPECIFIC_ADMIN_UID || data.role === 'admin';
      return {
        uid,
        email: data.email || null,
        displayName: data.displayName || null,
        photoURL: data.photoURL || null,
        role: isAdmin ? 'admin' : data.role || 'leitor',
        isBanned: !!data.isBanned,
        banReason: data.banReason || undefined
      };
    }
  } catch (err) {
    console.warn("Could not get user doc:", err);
  }
  return null;
}

export async function fetchArticlesFromFirestore(category?: string, maxItems: number = 60): Promise<Article[]> {
  try {
    const articlesCol = collection(db, 'articlesdoc');
    let q;
    
    if (category && category !== 'todos') {
      try {
        q = query(
          articlesCol,
          where('categoria', '==', category),
          orderBy('dataPublicacao', 'desc'),
          limit(maxItems)
        );
      } catch {
        q = query(articlesCol, where('categoria', '==', category), limit(maxItems));
      }
    } else {
      q = query(articlesCol, orderBy('dataPublicacao', 'desc'), limit(maxItems));
    }

    const snap = await getDocs(q);
    const articles: Article[] = [];

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      // Calculate reading time estimate (~200 words per min)
      const text = `${data.titulo || ''} ${data.resumo || ''} ${data.conteudo || ''}`;
      const wordCount = text.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
      const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));

      articles.push({
        id: docSnap.id,
        titulo: data.titulo || 'Sem título',
        categoria: (data.categoria || 'politica').toLowerCase(),
        resumo: data.resumo || '',
        conteudo: data.conteudo || '',
        imagemUrl: data.imagemUrl || null,
        autorId: data.autorId || null,
        autorNome: data.autorNome || 'Redação WazzimaGiygg',
        autorEmail: data.autorEmail || null,
        dataPublicacao: data.dataPublicacao || null,
        ultimaEdicao: data.ultimaEdicao || null,
        visualizacoes: typeof data.visualizacoes === 'number' ? data.visualizacoes : 0,
        isMultiLanguage: !!data.isMultiLanguage,
        languages: data.languages || ['pt'],
        defaultLanguage: data.defaultLanguage || 'pt',
        translations: data.translations || {},
        tags: data.tags || [],
        destaque: !!data.destaque,
        curtidas: typeof data.curtidas === 'number' ? data.curtidas : 0,
        _readingTimeMinutes: readingMinutes
      });
    });

    return articles;
  } catch (error) {
    console.error("Erro ao buscar artigos do Firestore:", error);
    // Fallback: try querying without order by in case of indexing requirement
    try {
      const articlesCol = collection(db, 'articlesdoc');
      const snap = await getDocs(query(articlesCol, limit(maxItems)));
      const articles: Article[] = [];
      snap.forEach((docSnap) => {
        const data = docSnap.data();
        if (category && category !== 'todos' && data.categoria !== category) {
          return;
        }
        articles.push({
          id: docSnap.id,
          titulo: data.titulo || 'Sem título',
          categoria: (data.categoria || 'politica').toLowerCase(),
          resumo: data.resumo || '',
          conteudo: data.conteudo || '',
          imagemUrl: data.imagemUrl || null,
          autorId: data.autorId || null,
          autorNome: data.autorNome || 'Redação WazzimaGiygg',
          autorEmail: data.autorEmail || null,
          dataPublicacao: data.dataPublicacao || null,
          ultimaEdicao: data.ultimaEdicao || null,
          visualizacoes: typeof data.visualizacoes === 'number' ? data.visualizacoes : 0,
          isMultiLanguage: !!data.isMultiLanguage,
          languages: data.languages || ['pt'],
          defaultLanguage: data.defaultLanguage || 'pt',
          translations: data.translations || {},
          tags: data.tags || [],
          destaque: !!data.destaque,
          curtidas: typeof data.curtidas === 'number' ? data.curtidas : 0,
          _readingTimeMinutes: 3
        });
      });
      return articles;
    } catch (e) {
      console.error("Falha ao recuperar artigos:", e);
      return [];
    }
  }
}

export async function fetchArticleById(id: string): Promise<Article | null> {
  try {
    const docRef = doc(db, 'articlesdoc', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;

    const data = snap.data();
    const text = `${data.titulo || ''} ${data.resumo || ''} ${data.conteudo || ''}`;
    const wordCount = text.replace(/<[^>]*>/g, '').trim().split(/\s+/).length;
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 180));

    return {
      id: snap.id,
      titulo: data.titulo || 'Sem título',
      categoria: (data.categoria || 'politica').toLowerCase(),
      resumo: data.resumo || '',
      conteudo: data.conteudo || '',
      imagemUrl: data.imagemUrl || null,
      autorId: data.autorId || null,
      autorNome: data.autorNome || 'Redação WazzimaGiygg',
      autorEmail: data.autorEmail || null,
      dataPublicacao: data.dataPublicacao || null,
      ultimaEdicao: data.ultimaEdicao || null,
      visualizacoes: typeof data.visualizacoes === 'number' ? data.visualizacoes : 0,
      isMultiLanguage: !!data.isMultiLanguage,
      languages: data.languages || ['pt'],
      defaultLanguage: data.defaultLanguage || 'pt',
      translations: data.translations || {},
      tags: data.tags || [],
      destaque: !!data.destaque,
      curtidas: typeof data.curtidas === 'number' ? data.curtidas : 0,
      _readingTimeMinutes: readingMinutes
    };
  } catch (err) {
    console.error("Erro ao carregar artigo por id:", err);
    return null;
  }
}

export async function incrementArticleViews(id: string): Promise<void> {
  try {
    const docRef = doc(db, 'articlesdoc', id);
    await updateDoc(docRef, {
      visualizacoes: increment(1)
    });
  } catch (err) {
    console.warn("Could not increment views:", err);
  }
}

export async function saveArticleToFirestore(
  articleData: Omit<Article, 'id' | 'dataPublicacao' | 'ultimaEdicao'>,
  id?: string
): Promise<string> {
  const isUpdate = !!id;
  const payload: any = {
    titulo: articleData.titulo,
    categoria: articleData.categoria,
    resumo: articleData.resumo,
    conteudo: articleData.conteudo,
    imagemUrl: articleData.imagemUrl || null,
    autorId: articleData.autorId || null,
    autorNome: articleData.autorNome || 'Redação',
    autorEmail: articleData.autorEmail || null,
    ultimaEdicao: serverTimestamp(),
    isMultiLanguage: !!articleData.isMultiLanguage,
    languages: articleData.languages || ['pt'],
    defaultLanguage: articleData.defaultLanguage || 'pt',
    translations: articleData.translations || {},
    tags: articleData.tags || [],
    destaque: !!articleData.destaque
  };

  if (isUpdate) {
    const docRef = doc(db, 'articlesdoc', id);
    await updateDoc(docRef, payload);
    return id;
  } else {
    payload.dataPublicacao = serverTimestamp();
    payload.visualizacoes = 0;
    payload.curtidas = 0;
    const docRef = await addDoc(collection(db, 'articlesdoc'), payload);
    return docRef.id;
  }
}

export async function deleteArticleFromFirestore(id: string): Promise<void> {
  const docRef = doc(db, 'articlesdoc', id);
  await deleteDoc(docRef);
}
