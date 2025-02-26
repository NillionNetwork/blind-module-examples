import { writeSurveyData, readSurveyData } from '@/lib/secretVault';

// Helper function to convert BigInt to string in objects
function convertBigIntToString(obj) {
  return JSON.parse(
    JSON.stringify(obj, (key, value) => {
      if (typeof value === 'bigint') {
        return value.toString();
      }
      return value;
    })
  );
}

export async function POST(request) {
  try {
    const { schemaId, data } = await request.json();
    if (!schemaId) throw new Error('Schema ID is required');

    const result = await writeSurveyData(schemaId, data);
    return Response.json({
      success: true,
      data: convertBigIntToString(result),
    });
  } catch (error) {
    console.error('Failed to write survey data:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const schemaId = searchParams.get('schemaId');
    if (!schemaId) {
      throw new Error('Schema ID is required');
    }

    const data = await readSurveyData(schemaId);
    return Response.json({ success: true, data: convertBigIntToString(data) });
  } catch (error) {
    console.error('Failed to read survey data:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
