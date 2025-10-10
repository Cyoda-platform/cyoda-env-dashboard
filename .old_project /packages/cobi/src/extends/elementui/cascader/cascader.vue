<template>
  <div ref="reference" :class="['el-cascader', realSize && `el-cascader--${realSize}`, { 'is-disabled': isDisabled }]" v-clickoutside="() => toggleDropDownVisible(false)" @mouseenter="inputHover = true" @mouseleave="inputHover = false" @click="() => toggleDropDownVisible(readonly ? undefined : true)" @keydown="handleKeyDown">
    <el-input ref="input" :size="realSize" :placeholder="placeholder" :readonly="readonly" :disabled="isDisabled" :validate-event="false" :class="{ 'is-focus': dropDownVisible }" @focus="handleFocus" @blur="handleBlur" @input="handleInput">
      <template #suffix>
        <i v-if="clearBtnVisible" key="clear" class="el-input__icon el-icon-circle-close" @click.stop="handleClear"></i>
        <i v-else key="arrow-down" :class="['el-input__icon', 'el-icon-arrow-down', dropDownVisible && 'is-reverse']" @click.stop="toggleDropDownVisible()"></i>
      </template>
    </el-input>

    <div v-if="multiple" class="el-cascader__tags">
      <el-tag v-for="tag in presentTags" :key="tag.key" type="info" :size="tagSize" :hit="tag.hitState" :closable="tag.closable" disable-transitions @close="deleteTag(tag)">
        <span>{{ tag.text }}</span>
      </el-tag>
      <input v-if="filterable && !isDisabled" v-model.trim="inputValue" type="text" class="el-cascader__search-input" :placeholder="presentTags.length ? '' : placeholder" @input="(e) => handleInput(inputValue, e)" @click.stop="toggleDropDownVisible(true)" @keydown.delete="handleDelete" />
    </div>

    <transition name="el-zoom-in-top" @after-leave="handleDropdownLeave">
      <div v-show="dropDownVisible" ref="popper" :class="['el-popper', 'el-cascader__dropdown', popperClass]">
        <el-cascader-panel ref="panel" v-show="!filtering" v-model="checkedValue" :options="options" :props="config" :border="false" :render-label="scopedSlots.default" @expand-change="handleExpandChange" @close="toggleDropDownVisible(false)"></el-cascader-panel>
        <el-scrollbar ref="suggestionPanel" v-if="filterable" v-show="filtering" tag="ul" class="el-cascader__suggestion-panel" view-class="el-cascader__suggestion-list" @keydown.native="handleSuggestionKeyDown">
          <template v-if="suggestions.length">
            <li v-for="(item, index) in suggestions" :key="item.uid" :class="['el-cascader__suggestion-item', item.checked && 'is-checked']" :tabindex="-1" @click="handleSuggestionClick(index)">
              <template v-if="$slots.suggestion">
                <slot name="suggestion" :item="item"></slot>
              </template>
              <template v-else>
                <span>{{ item.text }}</span>
              </template>
              <i v-if="item.checked" class="el-icon-check"></i>
            </li>
          </template>
          <slot v-else name="empty">
            <li class="el-cascader__empty-text">{{ t("el.cascader.noMatch") }}</li>
          </slot>
        </el-scrollbar>
      </div>
    </transition>
  </div>
</template>

<!--<script setup>-->
<!--import ElCascader from "element-plus/lib/cascader";-->

<!--export default {-->
<!--  name: "CyodaCascader",-->
<!--  extends: ElCascader-->
<!--};-->
<!--</script>-->
