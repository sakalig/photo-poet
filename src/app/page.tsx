'use client';

import {useState} from 'react';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {generatePoem} from '@/ai/flows/generate-poem';
import {useToast} from '@/hooks/use-toast';
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

export default function Home() {
  const [photoUrl, setPhotoUrl] = useState('');
  const [poem, setPoem] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false); // State for the AlertDialog
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
    setOpen(true);
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(poem);
      toast({
        title: 'Poem copied to clipboard!',
      });
      setOpen(false); // Close the AlertDialog after copying
    } catch (error: any) {
      console.error('Error copying poem to clipboard:', error);
      toast({
        title: 'Copying failed!',
        description: error.message || 'Could not copy the poem.',
        variant: 'destructive',
      });
    }
  };

  const handleShareToApps = async () => {
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
      setOpen(false);
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

      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Share Your Poem</AlertDialogTitle>
            <AlertDialogDescription>
              Choose how you want to share your poem.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpen(false)}>Cancel</AlertDialogCancel>
            <Button onClick={handleCopyToClipboard}>Copy to Clipboard</Button>
            <AlertDialogAction onClick={handleShareToApps}>Share to Apps</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
