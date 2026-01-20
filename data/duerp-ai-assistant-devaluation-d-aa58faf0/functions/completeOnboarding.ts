import { createClientFromRequest } from 'npm:@base44/sdk@0.8.13';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Authenticate user
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get payload
    const { tenantData, companyData, siteData } = await req.json();

    console.log('Starting onboarding for user:', user.email);

    // 1. Create Tenant (as service role to bypass RLS)
    const tenant = await base44.asServiceRole.entities.Tenant.create({
      name: tenantData.name,
      is_active: true
    });
    console.log('Tenant created:', tenant.id);

    // 2. Create UserProfile FIRST (as service role)
    const profile = await base44.asServiceRole.entities.UserProfile.create({
      user_email: user.email,
      tenant_id: tenant.id,
      app_role: 'admin_tenant',
      notifications_enabled: true
    });
    console.log('Profile created:', profile);

    // 3. Create Company (as service role)
    const company = await base44.asServiceRole.entities.Company.create({
      ...companyData,
      tenant_id: tenant.id
    });
    console.log('Company created:', company.id);

    // 4. Create Site (as service role)
    const site = await base44.asServiceRole.entities.Site.create({
      ...siteData,
      tenant_id: tenant.id,
      company_id: company.id
    });
    console.log('Site created:', site);

    return Response.json({ 
      success: true,
      tenant_id: tenant.id,
      company_id: company.id,
      site_id: site.id
    });

  } catch (error) {
    console.error('Error during onboarding:', error);
    return Response.json({ 
      error: error.message,
      details: error.toString()
    }, { status: 500 });
  }
});