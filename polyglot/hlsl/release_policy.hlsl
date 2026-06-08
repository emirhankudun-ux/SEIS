// SEIS Release Policy — HLSL (DirectX High-Level Shader Language)

cbuffer SeisMotionParams : register(b0)
{
    float motionDuration;   // 0.0=reduced, 0.3=balanced, 0.6=cinematic
    int   reducedMotion;    // 0 or 1
    int   releaseStatus;    // 0=ready, 1=blocked, 2=pending
    float padding;
};

float ResolveMotionDuration(float requested, int prefersReduced)
{
    return prefersReduced ? 0.0f : requested;
}

bool CanDeploy(int status)
{
    return status == 0;
}

// Vertex shader: pass-through with motion-aware alpha
struct VSInput  { float4 pos : POSITION; float2 uv : TEXCOORD0; };
struct PSInput  { float4 pos : SV_POSITION; float2 uv : TEXCOORD0; float alpha : TEXCOORD1; };

PSInput VS(VSInput input)
{
    PSInput output;
    output.pos   = input.pos;
    output.uv    = input.uv;
    output.alpha = CanDeploy(releaseStatus) ? 1.0f : 0.5f;
    return output;
}

float4 PS(PSInput input) : SV_TARGET
{
    float dur = ResolveMotionDuration(motionDuration, reducedMotion);
    float3 color = releaseStatus == 0 ? float3(0.13f, 0.77f, 0.37f)   // ready
                 : releaseStatus == 1 ? float3(0.94f, 0.27f, 0.27f)   // blocked
                 :                      float3(0.96f, 0.62f, 0.04f);  // pending
    return float4(color, input.alpha);
}
