// History.tsx

"use client"

import { Button } from '@/components/ui/button'
import axios from 'axios'
import Image, { StaticImageData } from 'next/image' // Import StaticImageData
import React, { useEffect, useState } from 'react'
import { aiToolsList } from './Aitools'
import Link from 'next/link'
import { Skeleton } from '@/components/ui/skeleton'
import { FileQuestion, Trash2 } from 'lucide-react' // Import Trash and a fallback icon
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

// Best Practice: Define a type for your history items
interface HistoryItem {
  recordId: string;
  aiAgentType: string;
  createdAt: string;
}

// Best Practice: Define a type for your AI Tool list items
interface AiTool {
  name: string;
  icon: string | StaticImageData;
  path: string;
  // ... other properties
}

function History() {
  const [userHistory, setUserHistory] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<HistoryItem | null>(null);

  useEffect(() => {
    GetHistory();
  }, [])

  const GetHistory = async () => {
    setLoading(true);
    const result = await axios.get('/api/history');
    setUserHistory(result.data);
    setLoading(false);
  }

  const GetAgentName = (path: string): AiTool | undefined => {
    const agent = aiToolsList.find(item => item.path === path);
    return agent;
  }

  const onHistoryDelete = async () => {
    if (!itemToDelete) return;
    
    try {
      await axios.delete('/api/history?recordId=' + itemToDelete.recordId);
      setUserHistory(prevHistory => prevHistory.filter(h => h.recordId !== itemToDelete.recordId));
    } catch (error) {
      console.error("Failed to delete history item:", error);
    } finally {
      setItemToDelete(null);
    }
  }

  return (
    <div className='mt-5 p-5 border rounded-xl'>
      <h2 className='font-bold text-lg'>Previous History</h2>
      <p>Here’s what you’ve worked on before.</p>

      {loading && (
        <div>
          {[1, 2, 3, 4, 5].map((item, index) => (
            <div key={index}>
              <Skeleton className="h-[50px] mt-4 w-full rounded-md" />
            </div>
          ))}
        </div>
      )}

      {userHistory?.length === 0 && !loading ? (
        <div className='flex items-center justify-center flex-col mt-6'>
          <Image src={'/bulb.png'} alt='bulb' width={50} height={50} />
          <h2>You don't have any history</h2>
          <Button className='mt-5'>Explore AI Tools</Button>
        </div>
      ) : (
        <div>
          {userHistory?.map((history, index) => {
            // 1. Get the agent object once to avoid multiple calls
            const agent = GetAgentName(history.aiAgentType);

            return (
              <div key={index} className='flex justify-between items-center my-3 border p-3 rounded-lg group hover:bg-gray-50 dark:hover:bg-neutral-800'>
                <Link href={`${history.aiAgentType}/${history.recordId}`} className='flex-grow flex items-center gap-5'>
                  
                  {/* 2. Conditionally render the Image or a fallback */}
                  {agent?.icon ? (
                    <Image src={agent.icon} alt={agent.name} width={20} height={20} />
                  ) : (
                    <FileQuestion className="h-5 w-5 text-gray-400" /> // Fallback icon
                  )}
                  
                  {/* 3. Use a fallback for the name as well */}
                  <h2>{agent?.name || 'Unknown Tool'}</h2>
                </Link>
                <div className='flex items-center gap-4'>
                  <h2 className='text-sm text-gray-500'>{new Date(history.createdAt).toLocaleString()}</h2>
                  
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      {/* Note: The onClick in Trash2 is redundant when using asChild, but safe */}
                      <button onClick={() => setItemToDelete(history)}>
                        <Trash2 className='h-5 w-5 text-red-500 cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity' />
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your
                          chat history and remove the data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setItemToDelete(null)}>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onHistoryDelete}>Continue</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  )
}

export default History;