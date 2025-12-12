
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Language } from './types';

interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Nav
    'nav.dashboard': 'Dashboard',
    'nav.create': 'Create Post',
    'nav.upload': 'Upload to FB',
    'nav.gallery': 'Gallery',
    'nav.settings': 'Settings',
    
    // Home
    'home.hero.title': 'Showcase Your',
    'home.hero.highlight': 'Handmade Products',
    'home.hero.subtitle': 'Empowering artisans and self-help groups to create stunning social media posts, find product alternatives, and grow their business with one click.',
    'home.cta.create': 'Create New Post',
    'home.cta.gallery': 'View Gallery',
    'home.card.branding': 'Instant Branding',
    'home.card.branding.desc': 'AI instantly generates a catchy name, alternatives, and captions.',
    'home.card.reach': 'Direct Reach',
    'home.card.reach.desc': 'Connect your Facebook Page and publish your products to the world.',
    'home.card.library': 'Product Library',
    'home.card.library.desc': 'Keep a history of all your generated posts.',

    // Generate
    'gen.title': 'Product Image',
    'gen.upload.title': 'Upload Product Photo',
    'gen.upload.desc': 'Click here to upload your handmade product',
    'gen.btn.analyze': 'Analyze & Generate',
    'gen.btn.analyzing': 'Analyzing Product...',
    'gen.btn.enhance': 'Make Product Look Premium',
    'gen.btn.enhancing': 'Enhancing visuals...',
    'gen.result.title': 'Product Strategy',
    'gen.result.subtitle': 'AI Generated Insights',
    'gen.copy': 'Copy All',
    'gen.use': 'Use in Post',
    'gen.section.caption': 'Short Caption',
    'gen.section.tagline': 'Tagline',
    'gen.section.story': 'Promotional Story',
    'gen.section.hashtags': 'Hashtags',
    'gen.section.audience': 'Target Audience',
    'gen.empty.title': 'Ready to Empower Your Brand?',
    'gen.empty.desc': 'Upload your product photo. Our AI will identify your craft and create a complete social media kit.',

    // Upload
    'upload.title': 'Upload to Facebook',
    'upload.preview': 'Post Preview',
    'upload.connect.title': 'Account Connection',
    'upload.connect.btn': 'Login with Facebook',
    'upload.select.page': 'Select Page',
    'upload.customize': 'Customize Caption',
    'upload.btn.publish': 'Publish Now',
    'upload.btn.publishing': 'Publishing...',
    'upload.success': 'Successfully uploaded!',
    'upload.use.long': 'Use Long Story',
    'upload.use.short': 'Reset to Short',
  },
  hi: {
    // Nav
    'nav.dashboard': 'डैशबोर्ड',
    'nav.create': 'पोस्ट बनाएं',
    'nav.upload': 'फेसबुक पर डालें',
    'nav.gallery': 'गैलरी',
    'nav.settings': 'सेटिंग्स',

    // Home
    'home.hero.title': 'अपने उत्पादों को',
    'home.hero.highlight': 'दुनिया को दिखाएं',
    'home.hero.subtitle': 'कारीगरों और स्वयं सहायता समूहों को सोशल मीडिया पोस्ट बनाने और अपना व्यवसाय बढ़ाने के लिए सशक्त बनाना।',
    'home.cta.create': 'नई पोस्ट बनाएं',
    'home.cta.gallery': 'गैलरी देखें',
    'home.card.branding': 'इंस्टेंट ब्रांडिंग',
    'home.card.branding.desc': 'AI तुरंत आपके उत्पाद के लिए आकर्षक नाम और कैप्शन तैयार करता है।',
    'home.card.reach': 'सीधी पहुंच',
    'home.card.reach.desc': 'अपने फेसबुक पेज को कनेक्ट करें और अपने उत्पादों को दुनिया के सामने रखें।',
    'home.card.library': 'उत्पाद लाइब्रेरी',
    'home.card.library.desc': 'अपने सभी बनाए गए पोस्ट का इतिहास रखें।',

    // Generate
    'gen.title': 'उत्पाद की छवि',
    'gen.upload.title': 'फोटो अपलोड करें',
    'gen.upload.desc': 'अपना हस्तनिर्मित उत्पाद अपलोड करने के लिए यहां क्लिक करें',
    'gen.btn.analyze': 'विश्लेषण करें और बनाएं',
    'gen.btn.analyzing': 'विश्लेषण कर रहा है...',
    'gen.btn.enhance': 'उत्पाद को प्रीमियम बनाएं',
    'gen.btn.enhancing': 'सुधारा जा रहा है...',
    'gen.result.title': 'उत्पाद रणनीति',
    'gen.result.subtitle': 'AI द्वारा सुझाव',
    'gen.copy': 'कॉपी करें',
    'gen.use': 'पोस्ट में उपयोग करें',
    'gen.section.caption': 'छोटा कैप्शन',
    'gen.section.tagline': 'टैगलाइन',
    'gen.section.story': 'प्रचार कहानी',
    'gen.section.hashtags': 'हैशटैग',
    'gen.section.audience': 'लक्ष्य ग्राहक',
    'gen.empty.title': 'अपने ब्रांड को सशक्त बनाने के लिए तैयार हैं?',
    'gen.empty.desc': 'अपनी फोटो अपलोड करें। हमारा AI आपकी कला की पहचान करेगा और सोशल मीडिया किट तैयार करेगा।',

    // Upload
    'upload.title': 'फेसबुक पर अपलोड करें',
    'upload.preview': 'पोस्ट पूर्वावलोकन',
    'upload.connect.title': 'खाता कनेक्शन',
    'upload.connect.btn': 'फेसबुक से लॉगिन करें',
    'upload.select.page': 'पेज चुनें',
    'upload.customize': 'कैप्शन बदलें',
    'upload.btn.publish': 'अभी प्रकाशित करें',
    'upload.btn.publishing': 'प्रकाशित हो रहा है...',
    'upload.success': 'सफलतापूर्वक अपलोड किया गया!',
    'upload.use.long': 'लम्बी कहानी उपयोग करें',
    'upload.use.short': 'छोटा कैप्शन रीसेट करें',
  },
  es: {
    // Nav
    'nav.dashboard': 'Tablero',
    'nav.create': 'Crear Post',
    'nav.upload': 'Subir a FB',
    'nav.gallery': 'Galería',
    'nav.settings': 'Ajustes',

    // Home
    'home.hero.title': 'Muestra tus',
    'home.hero.highlight': 'Productos Artesanales',
    'home.hero.subtitle': 'Empoderando a artesanos para crear publicaciones impresionantes y hacer crecer su negocio con un clic.',
    'home.cta.create': 'Crear Nuevo Post',
    'home.cta.gallery': 'Ver Galería',
    'home.card.branding': 'Marca Instantánea',
    'home.card.branding.desc': 'La IA genera nombres pegadizos y subtítulos al instante.',
    'home.card.reach': 'Alcance Directo',
    'home.card.reach.desc': 'Conecta tu página de Facebook y publica tus productos al mundo.',
    'home.card.library': 'Biblioteca de Productos',
    'home.card.library.desc': 'Mantén un historial de todas tus publicaciones generadas.',

    // Generate
    'gen.title': 'Imagen del Producto',
    'gen.upload.title': 'Subir Foto',
    'gen.upload.desc': 'Clic aquí para subir tu producto artesanal',
    'gen.btn.analyze': 'Analizar y Generar',
    'gen.btn.analyzing': 'Analizando...',
    'gen.btn.enhance': 'Mejorar Imagen',
    'gen.btn.enhancing': 'Mejorando...',
    'gen.result.title': 'Estrategia de Producto',
    'gen.result.subtitle': 'Ideas de IA',
    'gen.copy': 'Copiar Todo',
    'gen.use': 'Usar en Post',
    'gen.section.caption': 'Subtítulo Corto',
    'gen.section.tagline': 'Eslogan',
    'gen.section.story': 'Historia Promocional',
    'gen.section.hashtags': 'Hashtags',
    'gen.section.audience': 'Audiencia Objetivo',
    'gen.empty.title': '¿Listo para empoderar tu marca?',
    'gen.empty.desc': 'Sube tu foto. Nuestra IA identificará tu arte y creará un kit de redes sociales.',

    // Upload
    'upload.title': 'Subir a Facebook',
    'upload.preview': 'Vista Previa',
    'upload.connect.title': 'Conexión de Cuenta',
    'upload.connect.btn': 'Iniciar sesión con Facebook',
    'upload.select.page': 'Seleccionar Página',
    'upload.customize': 'Personalizar Subtítulo',
    'upload.btn.publish': 'Publicar Ahora',
    'upload.btn.publishing': 'Publicando...',
    'upload.success': '¡Subido con éxito!',
    'upload.use.long': 'Usar Historia Larga',
    'upload.use.short': 'Restablecer a Corto',
  }
};

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export const I18nProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    return (localStorage.getItem('socialai_lang') as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('socialai_lang', language);
  }, [language]);

  const t = (key: string): string => {
    const keys = key.split('.');
    let current: any = translations[language];
    
    // Fallback to English if translation missing
    let fallback: any = translations['en'];

    if (current && current[key]) return current[key];
    if (fallback && fallback[key]) return fallback[key];
    
    return key;
  };

  return (
    <I18nContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};
