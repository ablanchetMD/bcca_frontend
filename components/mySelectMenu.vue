<script lang="ts" setup>

import type { FormCategory } from '~~/types/FormCategory';

// Utility function for enum-like fields
function findInListById(list: FormCategory[], id: string | any, value: any) {
  if (typeof id !== 'string') return value; // Return default if id is not a string
  return list.find(item => item.value.toLowerCase() === id.toLowerCase()) ?? value;
}


// Utility function for arrays
function transformArrayByIds(array:[], list:[FormCategory], value:any) {
  if (!Array.isArray(array) || array.length === 0) {
    return [];
  }
  return array.map(value => findInListById(list, value, null)).filter(item => item !== null) ?? value;
}

const modelValue:any = defineModel({
  get(value: any) {    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return [];
      }      
      return transformArrayByIds(value as [],props.options as [FormCategory],[]);
    }else{      
      return findInListById(props.options as [FormCategory],value,null);
    }       
  },
  set(value: any) {    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return [];
      }      
      return value.map((option:FormCategory) => option.value);
    }else{        
      return (value as FormCategory).value;
    } 
  }
});

const props = defineProps({  
  options: {
    type: Array as PropType<Array<FormCategory>>,
    required: true,
  },
  label: String,
  name: String,
  tooltip: String,
  required: Boolean,
  multiple: Boolean,
  placeholder: String,
  searchable: Boolean,
  creatable: Boolean,
  searchableplaceholder:String,
  colspan: Number,  
});


</script>

<template>
  <div :class="`sm:col-span-${colspan || 12}`"> 
  <UFormGroup size="md" :name="name" >
      <template #label>
        {{ label }}
        <UTooltip v-if="tooltip" :text="tooltip">
          <Icon name="i-mdi-help-box" class="w-4 h-4 mx-0.5" />
        </UTooltip>
        <span class="text-red-500">{{ required ? '*' : '' }}</span>
      </template>
      <template #default="{ error }">                  
        <USelectMenu v-model="modelValue"
            :options="options"
            :multiple="multiple"
            :searchable="searchable"
            :searchable-placeholder="searchableplaceholder"
            :creatable="creatable"
            :trailing-icon="error ? 'i-heroicons-exclamation-triangle-20-solid' : undefined">                                               
            <template #default="{ open }">
                <UButton color="gray" class="flex-1 justify-between">                    
                        <template v-if="multiple">                        
                          <span v-if="modelValue?.length > 0" class="truncate">
                              <span v-for="(lang, index) in modelValue" :key="index">
                                  <Icon v-if="lang && lang?.icon.length > 0" :name="lang && lang.icon" class="w-4 h-4 mx-1" />
                                  {{ lang && lang.label }}{{ Number(index) < modelValue.length - 1 ? ', ' : '' }}
                              </span>
                          </span>
                          <span v-else>{{ placeholder }}</span>
                      </template>
                      <template v-else>  
                        <div>
                          <Icon v-if="(modelValue as FormCategory)?.icon.length > 0" :name="(modelValue as FormCategory)?.icon"
                            class="w-4 h-4 mx-1" />{{ (modelValue as FormCategory)?.label }}
                        </div> 
                      </template>                                                
                <UIcon name="i-heroicons-chevron-right-20-solid"
                    class="w-5 h-5 transition-transform text-gray-400 dark:text-gray-500"
                    :class="[open && 'transform rotate-90']" />


                </UButton>
            </template>                        
        </USelectMenu>
        </template>
    </UFormGroup>
  </div>
</template>

<style>

</style>