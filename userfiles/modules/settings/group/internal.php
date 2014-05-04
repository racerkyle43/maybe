<?php only_admin_access(); ?>
<script  type="text/javascript">
    mw.require('forms.js', true);
</script>
<script type="text/javascript">




  


 function save_sysconf_form(){


 mw.form.post('#sysconfig-form-<?php print $params['id'] ?>', '<?php print api_link('Adapters/save_config'); ?>',
			function(msg) {
mw.notification.msg(this);
 return false;
			});
            return false;

 }


</script>

Internal settings
<div class="mw_clear"></div>
<div class="vSpace"></div>
<style>
    .send-your-sysconf{
      float: right;
      width: 190px;
      text-align: center;
      margin-top: -77px;
    }
    .send-your-sysconf label{
      text-align: center;
    }

    .send-your-sysconf a{
      width: 175px;
      margin: auto
    }

    .mw-ui-table .mw-ui-field{
        background-color: transparent;
        border-color: transparent;
        width: 300px;
        height: 36px;
        resize: none;
    }
    .mw-ui-table .mw-ui-field:hover, .mw-ui-table .mw-ui-field:focus{
        background-color: white;
        border-color:#C6C6C6 #E6E6E6 #E6E6E6;
        resize: vertical;
    }

</style>
<?php


 
$cache_adapters = mw()->adapters->get_adapters('Cache');
 $system_cache_adapter = mw()->adapters->get_config('cache');
 if($system_cache_adapter == false){
$system_cache_adapter = 'default';	
}
  d($system_cache_adapter);
 
 d($cache_adapters);

 ?>
<form id="sysconfig-form-<?php print $params['id'] ?>" onSubmit="return save_sysconf_form();">
  <?php if(!empty($cache_adapters)): ?>
  <select name="cache" onChange="save_sysconf_form()">
    <?php foreach($cache_adapters as $cache_adapter): ?>
    <?php if(isset($cache_adapter['title']) and isset($cache_adapter['adapter'])): ?>
    <option value="<?php print $cache_adapter['adapter'] ?>"
    <?php if(isset($system_cache_adapter) and is_string($system_cache_adapter) and 
	stristr($cache_adapter['adapter'],$system_cache_adapter) == true): ?> selected <?php endif;  ?>
   >
    <?php  print  $cache_adapter['title'] ?>
    </option>
    <?php endif; ?>
    <?php endforeach; ?>
  </select>
    <?php endif; ?>
  <?php event_trigger('mw_admin_internal_settings', $params); ?>
  <input type="submit" value="Save" class="mw-ui-btn" />
</form>
