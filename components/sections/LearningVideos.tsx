
import React from 'react';

const videos = [
  { id: 1, title: 'Mastering the Past Simple Tense', description: 'Learn how to use the past simple tense correctly in your daily conversations.', thumbnail: 'https://picsum.photos/seed/vid1/400/225' },
  { id: 2, title: '10 Essential English Phrases for Beginners', description: 'Start speaking English today with these common and useful phrases.', thumbnail: 'https://picsum.photos/seed/vid2/400/225' },
  { id: 3, title: 'English Pronunciation Practice', description: 'Improve your accent and sound more like a native speaker with these tips.', thumbnail: 'https://picsum.photos/seed/vid3/400/225' },
  { id: 4, title: 'Conversation Skills: Small Talk', description: 'Never be afraid of starting a conversation again. Master the art of small talk.', thumbnail: 'https://picsum.photos/seed/vid4/400/225' },
];

const VideoCard: React.FC<{ title: string; description: string; thumbnail: string; }> = ({ title, description, thumbnail }) => (
  <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="group block bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl hover:-translate-y-1 transition-all duration-300">
    <img src={thumbnail} alt={title} className="w-full h-48 object-cover" />
    <div className="p-6">
      <h3 className="text-xl font-bold text-slate-800 group-hover:text-sky-600 transition-colors" lang="en">{title}</h3>
      <p className="mt-2 text-slate-600">{description}</p>
    </div>
  </a>
);

const LearningVideos: React.FC = () => {
  return (
    <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-4xl font-extrabold text-slate-800">فيديوهات تعليمية</h2>
        <p className="mt-4 text-xl text-slate-600">شاهد وتعلم من خلال مقاطع الفيديو المختارة بعناية.</p>
      </div>
      <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-2">
        {videos.map(video => (
          <VideoCard key={video.id} {...video} />
        ))}
      </div>
    </div>
  );
};

export default LearningVideos;
