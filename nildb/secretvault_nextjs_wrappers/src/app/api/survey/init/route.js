import { createSurveySchema } from '@/lib/secretVault';

export async function POST() {
  try {
    const schema = await createSurveySchema();
    return Response.json({ success: true, schemaId: schema[0].schemaId });
  } catch (error) {
    console.error('Failed to create schema:', error);
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
