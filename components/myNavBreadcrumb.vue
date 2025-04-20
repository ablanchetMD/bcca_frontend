<script lang="ts" setup>
import type { Protocol } from '~~/types/Protocol';
import type { Precaution,Caution, EligibilityCriteria } from '~~/types/Protocol_Criterias';
import type { Lab } from '~~/types/Labs';
import type { Med,Prescription } from '~~/types/Types';

const route = useRoute();
const api_route = useAppConfig().api.route;
const breadcrumbName = ref<string | null>(null);
const Loaded = ref(false);

const positions = await computed(() => {
  
  const currentpath = route.path;
  const default_label_class = 'text-lg font-medium';
  const default_icon_class = 'h-5 w-5';
  const ld_icon_class = "animate-spin h-5 w-5 motion-reduce:animate-[spin_1.5s_linear_infinite]"
  const default_icon = 'i-heroicons-document-20-solid';
  const ld_icon = 'i-heroicons-arrow-path-16-solid';
  let id = '';
  if (route.params.id) {
    id = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;  
  }else if (route.params.caution_id) {
    id = Array.isArray(route.params.caution_id) ? route.params.caution_id[0] : route.params.caution_id;
  }else if (route.params.eligibility_criteria_id) {
    id = Array.isArray(route.params.eligibility_criteria_id) ? route.params.eligibility_criteria_id[0] : route.params.eligibility_criteria_id;
  }else if (route.params.precaution_id) {
    id = Array.isArray(route.params.precaution_id) ? route.params.precaution_id[0] : route.params.precaution_id;
  }else if (route.params.lab_id) {
    id = Array.isArray(route.params.lab_id) ? route.params.lab_id[0] : route.params.lab_id;
  }else if (route.params.med_id) {
    id = Array.isArray(route.params.med_id) ? route.params.med_id[0] : route.params.med_id;
  }else if (route.params.prescription_id) {
    id = Array.isArray(route.params.prescription_id) ? route.params.prescription_id[0] : route.params.prescription_id;
  }else{
    id = '';
  }

  let label = '';
  let icon = '';
  let icon_class = ld_icon_class;

  if (Loaded.value) {    
    label = breadcrumbName.value as string;
    icon = default_icon;
    icon_class = default_icon_class;     
  }else{
    label = '';
    icon = ld_icon;
    icon_class = ld_icon_class;
  }
  
  // Dynamic routes
  const paths = [
    {
      path: 'protocols',
      label: 'Protocols',
      icon: 'i-heroicons-square-3-stack-3d-20-solid',
      to: '/protocols',
      children: [    
        {          
          path: 'edit',
          label: 'Edit',
          icon: 'i-heroicons-pencil-square-20-solid',
          to: '',
          children: [
            {
              path: '/'+id,
              label: label,
              icon: icon,
              iconClass: icon_class,
              to: '/protocols/edit/'+id,
            }
          ]
        },
        {
          path: 'view',
          label: 'View',
          icon: 'i-heroicons-eye-20-solid',
          to: '',
          children: [
            {
              path: '/'+id,
              label: label,
              icon: icon,
              iconClass: icon_class,
              to: id ? '/protocols/view/'+id : '/protocols',
            }
          ]
        },        
      ],
    },
    {
      path: 'admin',
      label: 'Admin',
      icon: 'i-heroicons-cog-6-tooth-20-solid',
      to: '/admin',
      children: [
        {          
          path: 'precautions',
          label: 'Precautions',
          icon: 'i-heroicons-exclamation-triangle-20-solid',
          to: '/admin/precautions',
          children: [
            {
              path: '/'+id,
              label: label,
              icon: icon,
              iconClass: icon_class,
              to: id ? '/admin/precautions/'+id : '/admin/precautions',
            }
          ]
        },
        {          
          path: 'labs',
          label: 'Labs',
          icon: 'medical-icon:i-laboratory',
          to: '/admin/labs',
          children: [
            {
              path: '/'+id,
              label: label,
              icon: icon,
              iconClass: icon_class,
              to: id ? '/admin/labs/'+id : '/admin/labs',
            }
          ]
        },
          {          
          path: 'meds',
          label: 'Medications',
          icon: 'solar:jar-of-pills-2-bold',
          to: '/admin/meds',
          children: [
            {
              path: '/'+id,
              label: label,
              icon: 'solar:hand-pills-linear',
              iconClass: icon_class,
              to: id ? '/admin/meds/'+id : '/admin/meds',
            }
          ]
        },
        {          
          path: 'prescriptions',
          label: 'Prescriptions',          
          icon: 'streamline:prescription-pills-drugs-healthcare-solid',
          to: '/admin/prescriptions',
          children: [
            {
              path: '/'+id,
              label: label,
              icon: 'solar:hand-pills-linear',
              iconClass: icon_class,
              to: id ? '/admin/prescriptions/'+id : '/admin/prescriptions',
            }
          ]
        },    
        {          
          path: 'cautions',
          label: 'Cautions',
          icon: 'i-heroicons-exclamation-triangle-20-solid',
          to: '/admin/cautions',
          children: [
            {
              path: '/'+id,
              label: label,
              icon: icon,
              iconClass: icon_class,
              to: id ? '/admin/cautions/'+id : '/admin/cautions',
            }
          ]
        },
        {          
          path: 'eligibility_criteria',
          label: 'Eligibility Criteria',
          icon: 'material-symbols:list-alt-check-rounded',
          to: '/admin/eligibility_criteria',
          children: [
            {
              path: '/'+id,
              label: label,
              icon: icon,
              iconClass: icon_class,
              to: id ? '/admin/eligibility_criteria/'+id : '/admin/eligibility_criteria',
            }
          ]
        },                
      ],
    },     
  ]

  const breadcrumbs = [
    { label: 'Home', to: '/', icon: 'i-heroicons-home',labelClass:default_label_class,iconClass:default_icon_class },    
  ]

  //Recursive function to build breadcrumbs
  const current = paths.find(p => currentpath.includes(p.path))
  function buildBreadcrumbs(current: any) {    
    if (current) {
      breadcrumbs.push({ label: current.label, to: current.to, icon: current.icon, labelClass:default_label_class,iconClass:current.iconClass })
        
      if (current.children && currentpath !== current.to) {
         
        buildBreadcrumbs(current.children.find((p: any) => currentpath.includes(p.path)))
      }
    }
  }

  buildBreadcrumbs(current)   
  return breadcrumbs  
})

// Also watch for path changes
watch(
  () => route.path,
  async () => {
    Loaded.value = false;
    breadcrumbName.value = null;
    // Reset the breadcrumb name
    
    if (route.params.id) {
      const data = await $fetch<Protocol | null>(`${api_route}/protocols/${route.params.id}`)
        breadcrumbName.value = useTextUtils().truncate(data?.code as string,20);
        Loaded.value = true;
    }
    if (route.params.caution_id){      
      const data = await $fetch<Caution | null>(`${api_route}/cautions/${route.params.caution_id}`);
      breadcrumbName.value = useTextUtils().truncate(data?.description as string, 20);
      Loaded.value = true;      
    }
    if (route.params.eligibility_criteria_id){      
      const data = await $fetch<EligibilityCriteria | null>(`${api_route}/eligibility_criteria/${route.params.eligibility_criteria_id}`);
      breadcrumbName.value = useTextUtils().truncate(data?.description as string, 20);
      Loaded.value = true;          
    }
    if (route.params.precaution_id){      
      const data = await $fetch<Precaution | null>(`${api_route}/precautions/${route.params.precaution_id}`);
      breadcrumbName.value = useTextUtils().truncate(data?.title as string, 20);
      Loaded.value = true;          
    }
    if (route.params.lab_id){      
      const data = await $fetch<Lab | null>(`${api_route}/labs/${route.params.lab_id}`);
      breadcrumbName.value = useTextUtils().truncate(data?.name as string, 20);
      Loaded.value = true;          
    }
    if (route.params.med_id){      
      const data = await $fetch<Med | null>(`${api_route}/medications/${route.params.med_id}`);
      breadcrumbName.value = useTextUtils().truncate(data?.name as string, 20);
      Loaded.value = true;          
    }   
    if (route.params.prescription_id){      
      const data = await $fetch<Prescription | null>(`${api_route}/prescriptions/${route.params.prescription_id}`);
      const composite_name = data?.medication_name + ' ' + data?.dose + ' ' + data?.route + ' ' + data?.frequency;
      breadcrumbName.value = useTextUtils().truncate(composite_name as string, 40);
      Loaded.value = true;          
    }      
  },
  { immediate: true }  
);



</script>

<template>
  <div class="">    
    <UBreadcrumb :links="positions" :key="positions.map(p => p.label).join('-')"/>
  </div>  
</template>

<style>

</style>