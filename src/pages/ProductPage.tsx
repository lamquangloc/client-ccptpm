import { useParams } from 'react-router-dom';

export default function ProductPage() {
  const { id } = useParams();

  return (
    <div>
      <h1 className="text-3xl font-bold">Chi tiết món</h1>
      <p className="mt-4 text-slate-600">Mã món: {id}</p>
    </div>
  );
}
