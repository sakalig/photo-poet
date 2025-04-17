'use client';

import {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {generatePoem} from '@/ai/flows/generate-poem';
import {useToast} from '@/hooks/use-toast';

export default function Home() {
  const [photoUrl, setPhotoUrl] = useState('');
  const [poem, setPoem] = useState('');
  const [loading, setLoading] = useState(false);
  const {toast} = useToast();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const generate = async () => {
    if (!photoUrl) {
      toast({
        title: 'Please upload a photo first.',
      });
      return;
    }

    setLoading(true);
    try {
      const result = await generatePoem({photoUrl});
      setPoem(result.poem);
    } catch (error: any) {
      console.error('Error generating poem:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to generate poem.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!poem) {
      toast({
        title: 'No poem to share!',
      });
      return;
    }

    try {
      await navigator.share({
        title: 'Photo Poet',
        text: poem,
        url: photoUrl,
      });
      toast({
        title: 'Shared successfully!',
      });
    } catch (error: any) {
      console.error('Error sharing poem:', error);
      toast({
        title: 'Sharing failed!',
        description: error.message || 'Could not share the poem.',
        variant: 'destructive',
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2">
      <Card className="w-full max-w-md space-y-4 p-4 rounded-lg shadow-md">
        <CardHeader>
          <CardTitle className="text-2xl font-semibold tracking-tight">Photo Poet</CardTitle>
          <CardDescription>Upload a photo and let AI generate a poem for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col space-y-2">
            <Input id="photo" type="file" accept="image/*" onChange={handlePhotoUpload} />
            {photoUrl && (
              <img
                src={photoUrl}
                alt="Uploaded photo"
                className="mt-2 rounded-md object-cover max-h-48 w-full"
              />
            )}
          </div>
          <Button onClick={generate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate Poem'}
          </Button>
          {poem && (
            <div className="mt-4">
              <Textarea
                readOnly
                value={poem}
                className="font-serif text-lg h-48 w-full rounded-md border-input bg-background px-3 py-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <Button className="mt-2 w-full" onClick={handleShare} disabled={loading}>
                Share Poem
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
