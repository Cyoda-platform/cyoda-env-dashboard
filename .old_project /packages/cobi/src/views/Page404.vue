<template>
  <el-container class="page-404">
    <el-row :gutter="20">
      <el-col :span="7" :offset="9">
        <div class="inner">
          <div class="clearfix">
            <h1>404</h1>
            <h4>Oops! You're lost.</h4>
            <p class="text-muted">The page you are looking for was not found.</p>
            <p class="text-muted">
              <router-link to="/">Return to main page</router-link>
            </p>
          </div>
        </div>
      </el-col>
    </el-row>
  </el-container>
</template>

<script setup lang="ts"></script>

<style lang="scss">
.page-404 {
  background-color: #ebedef;
  min-height: 100vh !important;
  align-items: center !important;
  h1 {
    margin-right: 1.5rem !important;
    font-weight: 300;
    line-height: 1.2;
    font-size: 4.5rem;
    float: left !important;
  }

  h4 {
    padding-top: 1rem !important;
    font-size: 1.3125rem;
    margin-bottom: 0.5rem;
    font-weight: 500;
    line-height: 1.2;
    margin-top: 0;
  }

  .text-muted {
    color: #768192 !important;
    margin-top: 0;
    margin-bottom: 1rem;
  }

  .inner {
    width: 100%;
  }

  .el-row {
    width: 100%;
    justify-content: center !important;
  }

  a {
    text-decoration: none !important;
    background-color: transparent !important;
    color: #3683dc;

    &:hover {
      text-decoration: underline !important;
    }
    &:after {
      display: none;
    }
  }
}
</style>
