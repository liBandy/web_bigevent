$(function(){
    var layer = layui.layer;
    var form = layui.form;
    var laypage = layui.laypage;

    //定义美化时间过滤器
    template.defaults.imports.dataFormat=function(date){
        const dt=new Date(date)

        var y=dt.getFullYear();
        var m=padZero(dt.getMonth()+1);
        var d=padZero(dt.getDay());

        var hh=padZero(dt.getHours());
        var mm=padZero(dt.getMinutes());
        var ss = padZero(dt.getSeconds());
        return y+'-'+m+'-'+d+' '+hh+':'+mm+':'+ss
    }

    function padZero(n) {
      return  n > 9 ? n : '0' + n;
    }
    var q={
        pagenum:1,
        pagesize:2,
        cate_id:'',
        state:''
    };

    function initTable(){
        $.ajax({
            method:'GET',
            url:'/my/article/list',
            data:q,
            success:function(res){
                if(res.status!==0){
                    return layer.msg('获取文章列表失败')
                }
                console.log(res)
                var htmlStr=template('tpl-table',res);
                $('tbody').html(htmlStr)
                renderPage(res.total);
            }
        })
    };

    initTable();

    //初始化文章分类方法
    function initCate() {
        $.ajax({
            method: 'GET',
            url: '/my/article/cates',
            success: function (res) {
                if (res.status !== 0) {
                    return layer.msg('获取分类数据失败')
                }
                // console.log(res);
                var htmlStr = template('tpl-cate', res);
                // console.log(htmlStr);
                $('[name=cate_id]').html(htmlStr);
                //通知layui重新渲染表单结构
                form.render();
            }
        })
    };
    initCate();

    $('#form-search').on('submit', function (e) {
        e.preventDefault();
        var cate_id = $('[name=cate_id]').val();
        var state = $('[name=state]').val();
        q.cate_id = cate_id;
        q.state = state;
        initTable();
    });

    function renderPage(total) {
        // console.log(total);
        laypage.render({
            elem: 'pageBox',
            count: total,
            limit: q.pagesize,
            curr: q.pagenum,
            limits:[2,3,5,10],
            layout:['count','limit','prev','page','next','skip'],
            jump: function(obj, first){
                //obj包含了当前分页的所有参数，比如：
                console.log(obj.curr); //得到当前页，以便向服务端请求对应页的数据。
                q.pagenum = obj.curr;
                console.log(obj.limit); //得到每页显示的条数
                q.pagesize = obj.limit;
                console.log(first);
                //首次不执行
                if(!first){
                  //do something
                    initTable();
                }
              }
        })
    };

    $('tbody').on('click', '.btn-delete', function () {
        var len = $('.btn-delete').length;
        console.log(len);
        var id = $(this).attr('data-id');
        layer.confirm('确认删除?', { icon: 3, title: '提示' }, function (index) {
            //do something
            $.ajax({
                method: 'GET',
                url: '/my/article/delete/' + id,
                success: function (res) {
                    if (res.status !== 0) {
                        return layer.msg('删除文章失败')
                    }
                    layer.msg('删除文章成功');
                    if (len === 1) {
                        q.pagenum = q.pagenum === 1 ? q.pagenum : q.pagenum - 1;
                        initTable();
                    }
                    initTable();
                }
            })
            layer.close(index);
        });
    });

    
})