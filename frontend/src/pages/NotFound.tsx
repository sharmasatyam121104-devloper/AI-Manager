import { Link } from 'react-router-dom';
import { Home, ArrowLeft, SearchX } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#09090b] px-4">
      <div className="w-full max-w-lg text-center">

        <div className="flex justify-center mb-8">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-violet-500/10 border border-violet-500/20">
            <SearchX size={38} className="text-violet-400" />
          </div>
        </div>

        <h1 className="text-8xl sm:text-9xl font-bold tracking-tighter text-white">
          404
        </h1>

        <h2 className="mt-4 text-2xl font-semibold text-white">
          Page Not Found
        </h2>

        <p className="mt-3 text-sm sm:text-base leading-relaxed text-zinc-400">
          Oops! The page you're looking for doesn't exist
          or may have been moved.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl bg-violet-600 px-6 py-3 text-sm font-medium text-white transition-all hover:bg-violet-500 hover:shadow-lg hover:shadow-violet-500/20"
          >
            <Home size={17} />
            Back to Home
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-xl border border-zinc-700 px-6 py-3 text-sm font-medium text-zinc-300 transition-all hover:bg-zinc-800"
          >
            <ArrowLeft size={17} />
            Go Back
          </button>
        </div>

        <p className="mt-12 text-xs text-zinc-600">
          Error Code: 404 · Page Not Found
        </p>

      </div>
    </div>
  );
};

export default NotFound;
