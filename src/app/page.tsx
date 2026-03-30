'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Stars, Play, Trophy, Users } from 'lucide-react';
import { useRESPECT } from '@/components/RESPECTProvider';
import Link from 'next/link';

// Temporary Mock Data for Games
const GEST_GAMES = [
  {
    id: 'letter-arrangement',
    title: 'Letter Arrangement',
    description: 'Learn to spell by arranging letters in the correct order!',
    subject: 'English',
    icon: '🔤',
    color: 'from-blue-400 to-indigo-500',
  },
  {
    id: 'math-adventure',
    title: 'Math Adventure',
    description: 'Solve fun addition and subtraction problems to win!',
    subject: 'Maths',
    icon: '➕',
    color: 'from-orange-400 to-red-500',
  },
  {
    id: 'science-discovery',
    title: 'Science Discovery',
    description: 'Explore nature and animals in this exciting quest.',
    subject: 'Science',
    icon: '🧬',
    color: 'from-emerald-400 to-teal-500',
  }
];

export default function Home() {
  const { isRespectLaunch, launchInfo } = useRESPECT();
  const userName = launchInfo.givenName || 'Student';

  return (
    <main className="flex-1 max-w-7xl mx-auto w-full px-6 py-12 md:py-20 text-slate-900">
      {/* Hero / Greeting */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 text-center md:text-left"
      >
        <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
          <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-bold border border-primary/20 flex items-center gap-2">
            <Stars className="w-4 h-4" />
            RESPECT Compatible
          </span>
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold text-slate-900 mb-6 tracking-tight leading-tight">
          Welcome back, <br className="hidden md:block" />
          <span className="text-primary">{userName}!</span>
        </h1>
        <p className="text-xl text-slate-600 max-w-2xl leading-relaxed">
          Ready for another learning adventure? Choose a game below to sharpen your skills and earn points!
        </p>
      </motion.div>

      {/* Stats Quick View (Mock) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-20">
        {[
          { icon: Trophy, label: 'Points Earned', value: '1,250', color: 'text-amber-500' },
          { icon: Gamepad2, label: 'Games Played', value: '12', color: 'text-indigo-500' },
          { icon: Users, label: 'Class Rank', value: '#3', color: 'text-emerald-500' },
        ].map((stat, idx) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 * idx }}
            className="glass-card p-6 rounded-3xl flex items-center gap-5"
          >
            <div className={`p-4 rounded-2xl bg-white shadow-sm ${stat.color}`}>
              <stat.icon className="w-8 h-8" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{stat.label}</p>
              <p className="text-3xl font-bold text-slate-800">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Games Grid */}
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
            <Gamepad2 className="text-primary" />
            Your Games
          </h2>
          <button className="text-primary font-bold hover:underline">View All</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
          {GEST_GAMES.map((game, idx) => (
            <motion.div
              key={game.id}
              whileHover={{ y: -8 }}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.1 }}
              className="group relative"
            >
              <div className="glass-card h-full rounded-[40px] overflow-hidden flex flex-col p-8 transition-all group-hover:shadow-2xl group-hover:shadow-primary/10">
                {/* Game Icon / Banner */}
                <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${game.color} flex items-center justify-center text-4xl shadow-lg mb-8 transform -rotate-6 group-hover:rotate-0 transition-transform`}>
                  {game.icon}
                </div>

                <div className="flex-1">
                  <span className="text-xs font-bold text-primary uppercase tracking-[0.2em] mb-3 block">
                    {game.subject}
                  </span>
                  <h3 className="text-2xl font-bold text-slate-800 mb-4">{game.title}</h3>
                  <p className="text-slate-600 leading-relaxed mb-8">
                    {game.description}
                  </p>
                </div>

                <Link 
                  href={`/games/${game.id}`}
                  className="w-full bg-slate-900 text-white py-5 rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-primary transition-colors shadow-xl"
                >
                  <Play className="w-5 h-5 fill-current" />
                  Play Now
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </main>
  );
}
