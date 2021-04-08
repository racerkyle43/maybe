<?php

/*

type: layout

name: Checkout V2

description: Checkout V2

*/
?>

<script type="text/javascript">
    showPaymentModule = function (paymentModule,paymentModulePath) {

        $('.js-payment-gateway-box').html('');

        var newShippingModuleElement  = $('<div/>').appendTo('#mw-payment-gateway-module-'+paymentModule);

        newShippingModuleElement.attr('id', 'mw-payment-gateway-module-render-'+paymentModule);
        newShippingModuleElement.attr('data-type',paymentModulePath);
        newShippingModuleElement.attr('class','js-payment-gateway-module-box');
        newShippingModuleElement.attr('template','checkout_v2');

        mw.reload_module(newShippingModuleElement);
    }
</script>

<?php
$selected_payment_gateway = false;

if (isset($params['selected_provider'])) {
    $selected_payment_gateway = $params['selected_provider'];
}
?>

<div class="mw-shipping-and-payments mb-5">
    <?php if (count($payment_options) > 0): ?>
        <div class="row">
            <div class="col-xs-12 col-md-6 col-md-offset-6 mb-3">
                <h4 class="mb-1" field="checkout_payment_information_title" rel="global" rel_id="<?php print $params['id'] ?>"><?php _e("Payment method"); ?></h4>
                <small class="text-muted d-block mb-2"> <?php _e("How you would like to pay"); ?></small>
            </div>
        </div>

        <div class="methods">
            <ul name="payment_gw" class="mw-payment-gateway mw-payment-gateway-<?php print $params['id']; ?>">
                <?php $count = 0;
                foreach ($payment_options as $payment_option) : $count++; ?>
                    <li>

                        <div class="form-group my-1 mt-3">
                            <div class="custom-control custom-radio checkout-v2-radio d-flex align-self-center pl-0 pt-3 ">

                                <label class="mx-2 mb-0" for="payment-option-<?php print $count; ?>">

                                <input type="radio" onchange="showPaymentModule('<?php echo md5($payment_option['gw_file']); ?>','<?php echo $payment_option['gw_file']; ?>');" id="payment-option-<?php print $count; ?>" value="<?php echo $payment_option['gw_file']; ?>" <?php if ($selected_payment_gateway == $payment_option['gw_file']): ?> checked="checked" <?php endif; ?> name="payment_gw" />

                                    <img src="<?php echo $payment_option['icon']; ?>" style="width:32px;" />

                                   <?php print  _e($payment_option['name']); ?>

                                </label>

                            </div>
                        </div>

                        <div id="mw-payment-gateway-module-<?php echo md5($payment_option['gw_file']); ?>" class="js-payment-gateway-box"></div>

                    </li>
                <?php endforeach; ?>
            </ul>
           </div>
    <?php endif; ?>

    <?php if (is_module($selected_payment_gateway)): ?>
        <script type="text/javascript">
            showPaymentModule('<?php echo md5($selected_payment_gateway); ?>','<?php echo $selected_payment_gateway ?>');
        </script>
    <?php endif; ?>

</div>
