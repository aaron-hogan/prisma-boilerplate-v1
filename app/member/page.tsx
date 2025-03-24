// app/member/page.tsx

/**
 * Member Dashboard Page
 * 
 * This page shows a cute cat for members.
 * It is protected by middleware and only accessible to users with MEMBER, ADMIN, or STAFF roles.
 */
export default function MemberPage() {
  return (
    <div className="w-full p-4">
      <h1 className="text-2xl font-bold mb-4">Members Area</h1>
      <p className="mb-6">Welcome to the exclusive members area</p>
      
      <div className="flex flex-col items-center">
        {/* Cat GIF */}
        <div className="border rounded-lg overflow-hidden shadow-md mb-4">
          <img 
            src="https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZXVjOTE4bXhkdnZucmZlMnJmajN4ZGl5cGQ5Z2M0Y2JpenhqYWppdCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/SEO7ub2q1fORa/200.webp" 
            alt="Happy cat" 
            width={200} 
            height={200}
            className="max-w-full h-auto"
          />
        </div>
        
        <p className="text-center text-xl mt-4">
          Thanks for being a member! 🐱
        </p>
      </div>
    </div>
  );
}